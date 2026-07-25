'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

const COL_OPTIONS = [2, 3, 4, 5, 6] as const;

export function ProductGridBlockEditor({ block, onUpdate }: Props) {
  const { title = '', columns = 4, category = '', limit = 12, showPrice = true } = block.props || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Título da seção</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ex: Nossos produtos"
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Colunas</label>
        <div className="grid grid-cols-5 gap-1">
          {COL_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => onUpdate({ columns: n })}
              className={`px-2 py-1.5 text-xs border rounded ${
                columns === n ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Categoria (vazio = todas)</label>
        <input
          type="text"
          value={category || ''}
          onChange={(e) => onUpdate({ category: e.target.value || null })}
          placeholder="Deixe vazio para mostrar todas"
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Filtra por categoria exata. O editor com lista de categorias entra na Fase 5.
        </p>
      </div>

      <div>
        <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
          <span>Limite de produtos</span>
          <span className="text-gray-500 font-mono">{limit}</span>
        </label>
        <input
          type="range"
          min={4}
          max={48}
          step={4}
          value={limit}
          onChange={(e) => onUpdate({ limit: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={showPrice}
          onChange={(e) => onUpdate({ showPrice: e.target.checked })}
          className="rounded"
        />
        Mostrar preço
      </label>
    </div>
  );
}
