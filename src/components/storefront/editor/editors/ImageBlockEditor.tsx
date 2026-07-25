'use client';

import { Block } from '@/lib/storefront-types';
import { ImagePicker } from '../ImagePicker';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

/**
 * Editor do bloco de imagem. Permite upload (via /storefront/upload-asset)
 * ou URL externa, e configuração de tamanho, legenda e cantos arredondados.
 */
export function ImageBlockEditor({ block, onUpdate }: Props) {
  const { imageUrl = '', alt = '', caption = '', width = 100, rounded = true } = block.props || {};

  return (
    <div className="space-y-3">
      <ImagePicker
        label="Imagem"
        value={imageUrl}
        onChange={(url) => onUpdate({ imageUrl: url })}
        aspect="video"
      />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Texto alternativo</label>
        <input
          type="text"
          value={alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Descrição para acessibilidade"
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Legenda</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Opcional"
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
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

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={rounded}
          onChange={(e) => onUpdate({ rounded: e.target.checked })}
          className="rounded"
        />
        Cantos arredondados
      </label>
    </div>
  );
}
