'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

const PROVIDER_OPTIONS: Array<{ value: 'youtube' | 'vimeo'; label: string }> = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'vimeo', label: 'Vimeo' },
];

const ASPECT_OPTIONS: Array<{ value: '16:9' | '4:3' | '1:1' | '9:16'; label: string }> = [
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
  { value: '9:16', label: '9:16' },
];

/**
 * Editor do bloco de vídeo. Recebe o `videoId` puro (sem URL completa):
 * ex: `dQw4w9WgXcQ` para https://www.youtube.com/watch?v=dQw4w9WgXcQ.
 */
export function VideoBlockEditor({ block, onUpdate }: Props) {
  const { provider = 'youtube', videoId = '', aspectRatio = '16:9' } = block.props || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Plataforma</label>
        <div className="grid grid-cols-2 gap-1">
          {PROVIDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ provider: opt.value })}
              className={`px-2 py-1.5 text-xs border rounded ${
                provider === opt.value
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
        <label className="block text-xs font-medium text-gray-700 mb-1">ID do vídeo</label>
        <input
          type="text"
          value={videoId}
          onChange={(e) => onUpdate({ videoId: e.target.value })}
          placeholder={provider === 'youtube' ? 'dQw4w9WgXcQ' : '76979871'}
          className="w-full text-sm px-2 py-1.5 border rounded-md font-mono"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Apenas o ID (após <code>?v=</code> ou o trecho final da URL).
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Proporção</label>
        <div className="grid grid-cols-4 gap-1">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ aspectRatio: opt.value })}
              className={`px-2 py-1.5 text-xs border rounded ${
                aspectRatio === opt.value
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
