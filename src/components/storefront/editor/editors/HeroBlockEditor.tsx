'use client';

import { Block } from '@/lib/storefront-types';
import { ImagePicker } from '../ImagePicker';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

const ALIGN_OPTIONS: Array<{ value: 'left' | 'center' | 'right'; label: string }> = [
  { value: 'left', label: 'Esquerda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Direita' },
];

const HEIGHT_OPTIONS: Array<{ value: 'sm' | 'md' | 'lg' | 'xl'; label: string }> = [
  { value: 'sm', label: 'Pequeno' },
  { value: 'md', label: 'Médio' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Extra' },
];

/**
 * Editor do bloco hero. Permite upload de imagem, configurar texto,
 * CTA, alinhamento, opacidade do overlay e altura.
 */
export function HeroBlockEditor({ block, onUpdate }: Props) {
  const {
    imageUrl = '',
    title = '',
    subtitle = '',
    ctaText = '',
    ctaUrl = '',
    overlayOpacity = 0.4,
    textAlign = 'center',
    height = 'lg',
  } = block.props || {};

  return (
    <div className="space-y-3">
      <ImagePicker
        label="Imagem de fundo"
        value={imageUrl}
        onChange={(url) => onUpdate({ imageUrl: url })}
        aspect="banner"
      />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ex: Bem-vindo à nossa loja"
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Subtítulo</label>
        <textarea
          value={subtitle}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          placeholder="Uma breve descrição"
          rows={2}
          className="w-full text-sm px-2 py-1.5 border rounded-md resize-y"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Texto do botão</label>
        <input
          type="text"
          value={ctaText}
          onChange={(e) => onUpdate({ ctaText: e.target.value })}
          placeholder="Ex: Ver produtos"
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">URL do botão</label>
        <input
          type="text"
          value={ctaUrl}
          onChange={(e) => onUpdate({ ctaUrl: e.target.value })}
          placeholder="/ ou https://..."
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
          <span>Opacidade do overlay</span>
          <span className="text-gray-500 font-mono">{Math.round(overlayOpacity * 100)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={0.8}
          step={0.05}
          value={overlayOpacity}
          onChange={(e) => onUpdate({ overlayOpacity: Number(e.target.value) })}
          className="w-full"
          disabled={!imageUrl}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Alinhamento do texto</label>
        <div className="grid grid-cols-3 gap-1">
          {ALIGN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ textAlign: opt.value })}
              className={`px-2 py-1.5 text-xs border rounded ${
                textAlign === opt.value
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
        <label className="block text-xs font-medium text-gray-700 mb-1">Altura</label>
        <div className="grid grid-cols-4 gap-1">
          {HEIGHT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ height: opt.value })}
              className={`px-2 py-1.5 text-xs border rounded ${
                height === opt.value
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
