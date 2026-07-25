'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
}

const ASPECT_CLASS: Record<string, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '9:16': 'aspect-[9/16]',
};

function buildEmbedUrl(provider: string, videoId: string): string | null {
  if (!videoId) return null;
  if (provider === 'youtube') {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (provider === 'vimeo') {
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return null;
}

/**
 * Bloco de vídeo (YouTube ou Vimeo) via iframe embed responsivo.
 * `videoId` é o ID puro do YouTube (`dQw4w9WgXcQ`) ou Vimeo (`76979871`).
 */
export function VideoBlock({ block }: Props) {
  const { provider = 'youtube', videoId = '', aspectRatio = '16:9' } = block.props || {};

  const embedUrl = buildEmbedUrl(provider, videoId);
  const aspectClass = ASPECT_CLASS[aspectRatio] || ASPECT_CLASS['16:9'];

  return (
    <section
      className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl"
      style={{
        marginTop: 'var(--sf-section-spacing)',
        marginBottom: 'var(--sf-section-spacing)',
      }}
    >
      {embedUrl ? (
        <div
          className={`relative w-full ${aspectClass} overflow-hidden bg-black`}
          style={{ borderRadius: 'var(--sf-radius)' }}
        >
          <iframe
            src={embedUrl}
            title="Vídeo"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className={`w-full ${aspectClass} border-2 border-dashed rounded-md flex items-center justify-center text-sm`}
          style={{
            borderColor: 'var(--sf-border)',
            color: 'var(--sf-text-muted)',
          }}
        >
          Configure o ID do vídeo para embed
        </div>
      )}
    </section>
  );
}
