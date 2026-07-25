'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

const LAYOUT_OPTIONS: Array<{ value: 'pills' | 'grid' | 'list'; label: string }> = [
  { value: 'pills', label: 'Pílulas' },
  { value: 'grid', label: 'Grade' },
  { value: 'list', label: 'Lista' },
];

export function CategoriesBlockEditor({ block, onUpdate }: Props) {
  const { title = '', layout = 'pills', showCount = true } = block.props || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Título da seção</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Layout</label>
        <div className="grid grid-cols-3 gap-1">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ layout: opt.value })}
              className={`px-2 py-1.5 text-xs border rounded ${
                layout === opt.value ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={showCount}
          onChange={(e) => onUpdate({ showCount: e.target.checked })}
          className="rounded"
        />
        Mostrar contagem de produtos
      </label>

      <p className="text-[10px] text-gray-400">
        As categorias são derivadas automaticamente dos produtos. Não é necessário cadastrá-las.
      </p>
    </div>
  );
}
