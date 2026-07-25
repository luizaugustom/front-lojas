'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

const LAYOUT_OPTIONS: Array<{ value: 'carousel' | 'grid'; label: string }> = [
  { value: 'carousel', label: 'Carrossel' },
  { value: 'grid', label: 'Grade' },
];

/**
 * Editor do bloco de promoções. Os produtos exibidos vêm
 * automaticamente do campo `isOnPromotion` dos produtos.
 */
export function PromotionsBlockEditor({ block, onUpdate }: Props) {
  const { title = 'Promoções', layout = 'carousel' } = block.props || {};

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
        <div className="grid grid-cols-2 gap-1">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ layout: opt.value })}
              className={`px-2 py-1.5 text-xs border rounded ${
                layout === opt.value
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-400">
        Os produtos exibidos são os que estão com promoção ativa. Configure em
        "Produtos" marcando cada item como promoção.
      </p>
    </div>
  );
}
