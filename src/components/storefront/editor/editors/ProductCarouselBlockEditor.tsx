'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

export function ProductCarouselBlockEditor({ block, onUpdate }: Props) {
  const { title = '', category = '', autoplay = false, limit = 10 } = block.props || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Título da seção</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ex: Em destaque"
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Categoria (opcional)</label>
        <input
          type="text"
          value={category || ''}
          onChange={(e) => onUpdate({ category: e.target.value || null })}
          placeholder="Deixe vazio para todas"
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
          <span>Quantidade</span>
          <span className="text-gray-500 font-mono">{limit}</span>
        </label>
        <input
          type="range"
          min={4}
          max={24}
          step={2}
          value={limit}
          onChange={(e) => onUpdate({ limit: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={autoplay}
          onChange={(e) => onUpdate({ autoplay: e.target.checked })}
          className="rounded"
        />
        Rotação automática (a cada 4s)
      </label>
    </div>
  );
}
