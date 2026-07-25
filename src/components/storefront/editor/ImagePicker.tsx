'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { storefrontApi } from '@/lib/api-endpoints';
import { getImageUrl } from '@/lib/image-utils';

/**
 * Seletor de imagem reutilizado nos editores de bloco (hero, about,
 * testimonials, etc). Aceita URL externa OU upload via /storefront/upload-asset.
 */
interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: 'square' | 'video' | 'banner' | 'auto';
}

const ASPECT_CLASS: Record<NonNullable<Props['aspect']>, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  banner: 'aspect-[3/1]',
  auto: '',
};

export function ImagePicker({ label, value, onChange, aspect = 'video' }: Props) {
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function commitUrl() {
    if (urlInput !== value) onChange(urlInput.trim());
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem maior que 10MB.');
      return;
    }
    setUploading(true);
    try {
      const res = await storefrontApi.uploadAsset(file);
      const url = res.data?.url || '';
      if (!url) throw new Error('Resposta sem URL');
      onChange(url);
      setUrlInput(url);
      toast.success('Imagem enviada');
    } catch (err: any) {
      toast.error('Falha no upload', {
        description: err?.response?.data?.message || err?.message,
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>

      {value ? (
        <div className="relative mb-2">
          <div
            className={`w-full ${ASPECT_CLASS[aspect]} bg-gray-50 border rounded-md overflow-hidden`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(value)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUrlInput('');
            }}
            className="absolute top-1 right-1 p-1 bg-white/90 border rounded text-red-600 hover:bg-white"
            title="Remover imagem"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={`w-full ${ASPECT_CLASS[aspect]} mb-2 border-2 border-dashed rounded-md flex items-center justify-center text-xs text-gray-400 bg-gray-50`}
        >
          Sem imagem
        </div>
      )}

      <input
        type="url"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        onBlur={commitUrl}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitUrl();
          }
        }}
        placeholder="https://... ou faça upload abaixo"
        className="w-full text-xs px-2 py-1.5 border rounded-md"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mt-1 w-full flex items-center justify-center gap-1.5 text-xs px-2 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {uploading ? 'Enviando...' : 'Enviar imagem'}
      </button>
    </div>
  );
}
