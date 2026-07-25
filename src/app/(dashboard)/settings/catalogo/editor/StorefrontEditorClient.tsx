'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useStorefrontEditor } from '@/store/storefront-editor-store';
import { storefrontApi } from '@/lib/api-endpoints';
import { Block, BlockType } from '@/lib/storefront-types';
import { getBlockDefinition } from '@/components/storefront/BlockRegistry';
import { EditorLayout } from '@/components/storefront/editor/EditorLayout';
import { BlockPalette } from '@/components/storefront/editor/BlockPalette';
import { Canvas } from '@/components/storefront/editor/Canvas';
import { PropertiesPanel } from '@/components/storefront/editor/PropertiesPanel';
import { Toolbar } from '@/components/storefront/editor/Toolbar';
import { ThemePanel } from '@/components/storefront/editor/ThemePanel';

/**
 * Página principal do editor visual do storefront. Layout 3 colunas:
 *  - Esquerda: BlockPalette (drag source de novos blocos)
 *  - Centro: Canvas (drop target + preview ao vivo, blocos reordenáveis)
 *  - Direita: PropertiesPanel (form do bloco selecionado) ou ThemePanel (aba)
 *
 * Carrega o design via API ao montar, salva como rascunho, e
 * publica sob demanda. Drag-and-drop usa @dnd-kit (sem dependência
 * de HTML5 nativo, melhor a11y).
 */
export function StorefrontEditorClient() {
  const [loading, setLoading] = useState(true);
  const [activeDrag, setActiveDrag] = useState<{ type: 'palette' | 'block'; blockType?: BlockType; blockId?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'theme'>('properties');

  const {
    blocks,
    theme,
    selectedBlockId,
    dirty,
    saving,
    designId,
    status,
    loadDesign,
    addBlock,
    reorderBlocks,
    selectBlock,
    updateBlockProps,
    updateTheme,
    updateBlockVisibility,
    removeBlock,
    duplicateBlock,
    undo,
    redo,
    canUndo,
    canRedo,
    markSaved,
    setSaving,
  } = useStorefrontEditor();

  // Sensors do dnd-kit: pointer + keyboard (acessibilidade)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Carrega design na primeira montagem
  useEffect(() => {
    (async () => {
      try {
        const res = await storefrontApi.getDesign();
        loadDesign({
          id: res.data?.id ?? null,
          status: res.data?.status ?? 'DRAFT',
          theme: res.data?.theme ?? useStorefrontEditor.getState().theme,
          blocks: res.data?.blocks ?? [],
        });
      } catch (err: any) {
        toast.error('Erro ao carregar design', {
          description: err?.response?.data?.message || err?.message,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [loadDesign]);

  // Atalho de teclado: Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z = redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        if (canRedo()) redo();
      } else if (e.key === 's') {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canUndo, canRedo, undo, redo]);

  // Aviso ao sair com mudanças não salvas
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  async function handleSave() {
    setSaving(true);
    try {
      await storefrontApi.saveDraft({ theme, blocks });
      markSaved();
      toast.success('Rascunho salvo');
    } catch (err: any) {
      toast.error('Erro ao salvar', { description: err?.response?.data?.message || err?.message });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setSaving(true);
    try {
      // Primeiro salva (caso haja mudanças), depois publica
      if (dirty) await storefrontApi.saveDraft({ theme, blocks });
      await storefrontApi.publish();
      markSaved();
      toast.success('Catálogo publicado! As alterações estão visíveis publicamente.');
    } catch (err: any) {
      toast.error('Erro ao publicar', { description: err?.response?.data?.message || err?.message });
    } finally {
      setSaving(false);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const data = active.data.current;
    if (data?.source === 'palette') {
      setActiveDrag({ type: 'palette', blockType: data.blockType });
    } else {
      setActiveDrag({ type: 'block', blockId: active.id as string });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Caso 1: arrastar do palette → adiciona novo bloco
    if (activeData?.source === 'palette') {
      const blockType = activeData.blockType as BlockType;
      const def = getBlockDefinition(blockType);
      if (!def) return;
      // Se soltou sobre um bloco existente, insere antes dele; senão, no fim
      const targetIndex = overData?.blockIndex !== undefined ? overData.blockIndex : blocks.length;
      addBlock(blockType, targetIndex);
      return;
    }

    // Caso 2: reordenar bloco existente dentro do canvas
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        reorderBlocks(oldIndex, newIndex);
      }
    }
  }

  const activeBlockForOverlay = (() => {
    if (!activeDrag) return null;
    if (activeDrag.type === 'palette' && activeDrag.blockType) {
      const def = getBlockDefinition(activeDrag.blockType);
      return def ? { type: activeDrag.blockType, label: def.label } : null;
    }
    if (activeDrag.type === 'block' && activeDrag.blockId) {
      const b = blocks.find((x) => x.id === activeDrag.blockId);
      if (!b) return null;
      const def = getBlockDefinition(b.type);
      return { type: b.type, label: def?.label || b.type };
    }
    return null;
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <EditorLayout
        palette={<BlockPalette />}
        canvas={
          <Canvas
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelect={selectBlock}
          />
        }
        panel={
          <PropertiesPanel
            tab={activeTab}
            onTabChange={setActiveTab}
            properties={
              <BlockProperties
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                onUpdateProps={updateBlockProps}
                onUpdateVisibility={updateBlockVisibility}
                onRemove={removeBlock}
                onDuplicate={duplicateBlock}
              />
            }
            theme={<ThemePanel theme={theme} onUpdate={updateTheme} />}
          />
        }
        toolbar={
          <Toolbar
            dirty={dirty}
            saving={saving}
            status={status}
            designId={designId}
            canUndo={canUndo()}
            canRedo={canRedo()}
            onUndo={undo}
            onRedo={redo}
            onSave={handleSave}
            onPublish={handlePublish}
          />
        }
      />

      <DragOverlay>
        {activeBlockForOverlay ? (
          <div
            className="bg-white shadow-xl rounded-md px-4 py-3 border-2 border-blue-500 cursor-grabbing"
            style={{ borderRadius: 'var(--sf-radius, 0.5rem)' }}
          >
            <span className="text-sm font-medium">{activeBlockForOverlay.label}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Sub-componente: encaminha props do bloco selecionado para o editor certo
function BlockProperties(props: {
  blocks: Block[];
  selectedBlockId: string | null;
  onUpdateProps: (id: string, p: Record<string, any>) => void;
  onUpdateVisibility: (id: string, v: boolean) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const { blocks, selectedBlockId, onUpdateProps, onUpdateVisibility, onRemove, onDuplicate } = props;
  const selected = selectedBlockId ? blocks.find((b) => b.id === selectedBlockId) : null;

  if (!selected) {
    return (
      <div className="p-6 text-sm text-gray-500 text-center">
        Selecione um bloco no canvas para editar suas propriedades.
      </div>
    );
  }

  const def = getBlockDefinition(selected.type);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">{def?.label || selected.type}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{def?.description}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onDuplicate(selected.id)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Duplicar"
            aria-label="Duplicar bloco"
          >
            <CopyIcon />
          </button>
          <button
            onClick={() => onRemove(selected.id)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
            title="Remover"
            aria-label="Remover bloco"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={selected.visible}
          onChange={(e) => onUpdateVisibility(selected.id, e.target.checked)}
          className="rounded"
        />
        Visível na página
      </label>

      <div className="border-t pt-4">
        <BlockPropertyEditor
          block={selected}
          onUpdate={(props) => onUpdateProps(selected.id, props)}
        />
      </div>
    </div>
  );
}

// Editor genérico de props: despacha para o editor específico do tipo
function BlockPropertyEditor({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}) {
  const { TextBlockEditor } = require('@/components/storefront/editor/editors/TextBlockEditor');
  const { ImageBlockEditor } = require('@/components/storefront/editor/editors/ImageBlockEditor');
  const { SpacerBlockEditor } = require('@/components/storefront/editor/editors/SpacerBlockEditor');
  const { HeaderBlockEditor } = require('@/components/storefront/editor/editors/HeaderBlockEditor');
  const { HeroBlockEditor } = require('@/components/storefront/editor/editors/HeroBlockEditor');
  const { VideoBlockEditor } = require('@/components/storefront/editor/editors/VideoBlockEditor');
  const { DividerBlockEditor } = require('@/components/storefront/editor/editors/DividerBlockEditor');
  const { ProductGridBlockEditor } = require('@/components/storefront/editor/editors/ProductGridBlockEditor');
  const { ProductCarouselBlockEditor } = require('@/components/storefront/editor/editors/ProductCarouselBlockEditor');
  const { FeaturedProductsBlockEditor } = require('@/components/storefront/editor/editors/FeaturedProductsBlockEditor');
  const { CategoriesBlockEditor } = require('@/components/storefront/editor/editors/CategoriesBlockEditor');
  const { PromotionsBlockEditor } = require('@/components/storefront/editor/editors/PromotionsBlockEditor');
  const { CouponBlockEditor } = require('@/components/storefront/editor/editors/CouponBlockEditor');
  const { TestimonialsBlockEditor } = require('@/components/storefront/editor/editors/TestimonialsBlockEditor');
  const { AboutBlockEditor } = require('@/components/storefront/editor/editors/AboutBlockEditor');

  switch (block.type) {
    case 'header':
      return <HeaderBlockEditor block={block} onUpdate={onUpdate} />;
    case 'hero':
      return <HeroBlockEditor block={block} onUpdate={onUpdate} />;
    case 'text':
      return <TextBlockEditor block={block} onUpdate={onUpdate} />;
    case 'image':
      return <ImageBlockEditor block={block} onUpdate={onUpdate} />;
    case 'video':
      return <VideoBlockEditor block={block} onUpdate={onUpdate} />;
    case 'spacer':
      return <SpacerBlockEditor block={block} onUpdate={onUpdate} />;
    case 'divider':
      return <DividerBlockEditor block={block} onUpdate={onUpdate} />;
    case 'product_grid':
      return <ProductGridBlockEditor block={block} onUpdate={onUpdate} />;
    case 'product_carousel':
      return <ProductCarouselBlockEditor block={block} onUpdate={onUpdate} />;
    case 'featured_products':
      return <FeaturedProductsBlockEditor block={block} onUpdate={onUpdate} />;
    case 'categories':
      return <CategoriesBlockEditor block={block} onUpdate={onUpdate} />;
    case 'promotions':
      return <PromotionsBlockEditor block={block} onUpdate={onUpdate} />;
    case 'coupon':
      return <CouponBlockEditor block={block} onUpdate={onUpdate} />;
    case 'testimonials':
      return <TestimonialsBlockEditor block={block} onUpdate={onUpdate} />;
    case 'about':
      return <AboutBlockEditor block={block} onUpdate={onUpdate} />;
    default:
      return (
        <div className="text-xs text-gray-400 italic">
          Editor para {block.type} ainda não implementado.
        </div>
      );
  }
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
