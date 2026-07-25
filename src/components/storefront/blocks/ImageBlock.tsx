'use client';

import Image from 'next/image';
import { Block } from '@/lib/storefront-types';

interface ImageBlockProps {
  block: Block;
}

export function ImageBlock({ block }: ImageBlockProps) {
  const { imageUrl, alt = '', caption = '', width = 100, rounded = true } = block.props || {};

  if (!imageUrl) {
    return (
      <section
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ marginTop: 'var(--sf-section-spacing)', marginBottom: 'var(--sf-section-spacing)' }}
      >
        <div
          className="bg-gray-100 flex items-center justify-center text-gray-400 mx-auto h-48"
          style={{
            width: `${width}%`,
            borderRadius: rounded ? 'var(--sf-radius)' : 0,
          }}
        >
          <span className="text-sm">Imagem não configurada</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto px-4 sm:px-6 lg:px-8"
      style={{ marginTop: 'var(--sf-section-spacing)', marginBottom: 'var(--sf-section-spacing)' }}
    >
      <figure className="mx-auto" style={{ width: `${width}%` }}>
        <div
          className="relative w-full overflow-hidden bg-gray-100"
          style={{
            aspectRatio: '16 / 9',
            borderRadius: rounded ? 'var(--sf-radius)' : 0,
          }}
        >
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>
        {caption && (
          <figcaption
            className="text-sm mt-2 text-center"
            style={{ color: 'var(--sf-text-muted)' }}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
