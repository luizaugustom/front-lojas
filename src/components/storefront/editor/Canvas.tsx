'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block } from '@/lib/storefront-types';
import { StorefrontRenderer } from '@/components/storefront/StorefrontRenderer';
import { getBlockDefinition } from '@/components/storefront/BlockRegistry';
import { useStorefrontEditor } from '@/store/storefront-editor-store';
import { ViewportSwitcher, Viewport, viewportWidth } from './ViewportSwitcher';

interface CanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * Centro do editor. Mostra o preview ao vivo do storefront (mesmo
 * renderer que o público) com sobreposições para seleção e drag handles.
 *
 * Suporta preview responsivo: o usuário pode alternar entre desktop,
 * tablet e celular para ver como o layout aparece em cada dispositivo.
 *
 * `useSortable` em cada item + `useDroppable` no container permitem:
 *  - arrastar do palette → adiciona bloco
 *  - arrastar dentro do canvas → reordena
 */
export function Canvas({ blocks, selectedBlockId, onSelect }: CanvasProps) {
  const theme = useStorefrontEditor((s) => s.theme);
  const [viewport, setViewport] = useState<Viewport>('desktop');

  return (
    <div className="p-6 min-h-full">
      <div className="flex justify-center mb-4">
        <ViewportSwitcher value={viewport} onChange={setViewport} />
      </div>

      <CanvasDropZone viewport={viewport}>
        {blocks.length === 0 ? (
          <EmptyCanvas />
        ) : (
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-0">
              {blocks.map((block, index) => (
                <SortableBlockWrapper
                  key={block.id}
                  block={block}
                  index={index}
                  isSelected={block.id === selectedBlockId}
                  onSelect={() => onSelect(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}
        <div className="h-32" />
      </CanvasDropZone>
    </div>
  );
}

function CanvasDropZone({
  children,
  viewport,
}: {
  children: React.ReactNode;
  viewport: Viewport;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-end',
    data: { blockIndex: -1 },
  });

  const width = viewportWidth(viewport);
  const isMobile = viewport !== 'desktop';

  return (
    <div className="mx-auto flex justify-center">
      <div
        ref={setNodeRef}
        style={{
          width,
          maxWidth: '100%',
        }}
        className={`bg-white shadow-sm rounded-lg overflow-hidden border transition-all ${
          isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
        } ${isMobile ? 'border-x' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}

function EmptyCanvas() {
  return (
    <div className="p-16 text-center">
      <div className="text-4xl mb-2">🎨</div>
      <h3 className="text-lg font-medium text-gray-900">Catálogo vazio</h3>
      <p className="text-sm text-gray-500 mt-1">
        Arraste blocos da barra à esquerda para começar a montar sua página.
      </p>
    </div>
  );
}

function SortableBlockWrapper({
  block,
  index,
  isSelected,
  onSelect,
}: {
  block: Block;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { blockIndex: index },
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: `drop-before-${block.id}`,
    data: { blockIndex: index },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const def = getBlockDefinition(block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative border-2 transition ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-blue-200'
      }`}
    >
      {/* Drop zone antes do bloco (para inserir acima) */}
      <div ref={setDropRef} className="h-0 group-hover:h-1 hover:h-3 transition-all bg-blue-100" />

      {/* Overlay de seleção e ações */}
      <div
        className={`absolute top-2 right-2 z-10 flex items-center gap-1 bg-white shadow-md rounded-md p-1 ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } transition`}
      >
        <button
          {...listeners}
          {...attributes}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          title="Arrastar para reordenar"
          aria-label="Arrastar para reordenar"
          onClick={(e) => e.stopPropagation()}
        >
          <DragHandleIcon />
        </button>
        <span className="text-xs font-medium text-gray-600 px-1.5">
          {def?.label || block.type}
        </span>
      </div>

      {/* Conteúdo do bloco: clique seleciona */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={!block.visible ? 'opacity-40' : ''}
      >
        <StorefrontRenderer blocks={[block]} theme={useStorefrontEditor.getState().theme} />
      </div>
    </div>
  );
}

function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="18" r="1" />
    </svg>
  );
}
