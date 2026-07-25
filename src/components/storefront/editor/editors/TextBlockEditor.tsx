'use client';

import { Block } from '@/lib/storefront-types';
import { RichTextEditor } from '../RichTextEditor';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

const alignOptions: Array<{ value: 'left' | 'center' | 'right'; label: string }> = [
  { value: 'left', label: 'Esquerda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Direita' },
];

const maxWidthOptions: Array<{ value: 'sm' | 'md' | 'lg' | 'full'; label: string }> = [
  { value: 'sm', label: 'Pequena' },
  { value: 'md', label: 'Média' },
  { value: 'lg', label: 'Grande' },
  { value: 'full', label: 'Total' },
];

/**
 * Editor do bloco de texto com RichTextEditor (negrito, listas, links).
 */
export function TextBlockEditor({ block, onUpdate }: Props) {
  const { html = '', align = 'left', maxWidth = 'md' } = block.props || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Conteúdo</label>
        <RichTextEditor
          value={String(html)}
          onChange={(newHtml) => onUpdate({ html: newHtml })}
          placeholder="Digite o texto do bloco"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Alinhamento</label>
        <div className="grid grid-cols-3 gap-1">
          {alignOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ align: opt.value })}
              className={`px-2 py-1.5 text-xs border rounded ${
                align === opt.value
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
        <label className="block text-xs font-medium text-gray-700 mb-1">Largura máxima</label>
        <select
          value={maxWidth}
          onChange={(e) => onUpdate({ maxWidth: e.target.value })}
          className="w-full text-sm px-2 py-1.5 border rounded-md bg-white"
        >
          {maxWidthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
