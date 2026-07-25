'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

const STYLE_OPTIONS: Array<{ value: 'solid' | 'dashed' | 'dotted'; label: string }> = [
  { value: 'solid', label: 'Sólido' },
  { value: 'dashed', label: 'Tracejado' },
  { value: 'dotted', label: 'Pontilhado' },
];

/**
 * Editor do divisor. `color` aceita qualquer cor CSS (hex/rgb/named).
 */
export function DividerBlockEditor({ block, onUpdate }: Props) {
  const { style = 'solid', color = '#E5E7EB', width = 100 } = block.props || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Estilo</label>
        <div className="grid grid-cols-3 gap-1">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ style: opt.value })}
              className={`px-2 py-1.5 text-xs border rounded ${
                style === opt.value
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-8 w-12 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1 text-xs px-2 py-1.5 border rounded-md font-mono"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
          <span>Largura</span>
          <span className="text-gray-500 font-mono">{width}%</span>
        </label>
        <input
          type="range"
          min={20}
          max={100}
          step={5}
          value={width}
          onChange={(e) => onUpdate({ width: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
