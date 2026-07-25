'use client';

import { Block } from '@/lib/storefront-types';
import { ImagePicker } from '../ImagePicker';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

const SIDE_OPTIONS: Array<{ value: 'left' | 'right'; label: string }> = [
  { value: 'left', label: 'Esquerda' },
  { value: 'right', label: 'Direita' },
];

/**
 * Editor do bloco Sobre. Texto é plain-text por enquanto (o rich text
 * editor entra na Fase 5). Imagem opcional, posição configurável.
 */
export function AboutBlockEditor({ block, onUpdate }: Props) {
  const {
    title = 'Sobre nós',
    html = '',
    imageUrl = '',
    imageSide = 'left',
  } = block.props || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Texto</label>
        <textarea
          value={String(html || '').replace(/<[^>]*>/g, '')}
          onChange={(e) => onUpdate({ html: e.target.value })}
          rows={6}
          className="w-full text-sm px-2 py-1.5 border rounded-md resize-y"
          placeholder="Conte a história da empresa. Texto simples, sem HTML."
        />
      </div>

      <ImagePicker
        label="Imagem (opcional)"
        value={imageUrl}
        onChange={(url) => onUpdate({ imageUrl: url })}
        aspect="video"
      />

      {imageUrl && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Posição da imagem
          </label>
          <div className="grid grid-cols-2 gap-1">
            {SIDE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ imageSide: opt.value })}
                className={`px-2 py-1.5 text-xs border rounded ${
                  imageSide === opt.value
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
