'use client';

import { useDraggable } from '@dnd-kit/core';
import { listBlocksByCategory, getBlockDefinition } from '@/components/storefront/BlockRegistry';
import { BlockType } from '@/lib/storefront-types';
import { useMemo, useState } from 'react';

const CATEGORIES: Array<{ key: 'content' | 'product' | 'marketing'; label: string }> = [
  { key: 'content', label: 'Conteúdo' },
  { key: 'product', label: 'Produtos' },
  { key: 'marketing', label: 'Marketing' },
];

/**
 * Sidebar esquerda do editor. Lista os blocos disponíveis agrupados
 * por categoria. Cada item é um `useDraggable` que ao ser solto no
 * canvas adiciona um novo bloco daquele tipo.
 */
export function BlockPalette() {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">Blocos</h2>
      <p className="text-xs text-gray-500 mb-4">Arraste para o canvas</p>

      {CATEGORIES.map(({ key, label }) => (
        <CategorySection key={key} category={key} label={label} />
      ))}
    </div>
  );
}

function CategorySection({ category, label }: { category: 'content' | 'product' | 'marketing'; label: string }) {
  const [expanded, setExpanded] = useState(true);
  const blocks = useMemo(() => listBlocksByCategory(category), [category]);

  if (blocks.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full text-xs font-medium text-gray-700 uppercase tracking-wider mb-2"
      >
        <span>{label}</span>
        <span className="text-gray-400">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="space-y-1">
          {blocks.map((def) => (
            <PaletteItem key={def.type} blockType={def.type} label={def.label} description={def.description} />
          ))}
        </div>
      )}
    </div>
  );
}

function PaletteItem({
  blockType,
  label,
  description,
}: {
  blockType: BlockType;
  label: string;
  description: string;
}) {
  const def = getBlockDefinition(blockType);
  const isImplemented = def && def.Renderer.name !== 'PlaceholderBlock';

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${blockType}`,
    data: { source: 'palette', blockType },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-full text-left p-2.5 rounded border bg-white hover:border-blue-400 hover:shadow-sm transition cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30' : ''
      } ${!isImplemented ? 'opacity-60' : ''}`}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description}</div>
        </div>
        {!isImplemented && (
          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">em breve</span>
        )}
      </div>
    </button>
  );
}
