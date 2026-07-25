'use client';

import Image from 'next/image';
import { Block } from '@/lib/storefront-types';
import { getImageUrl } from '@/lib/image-utils';
import { sanitizeHtml } from '../../shared/safe-html';

interface Props {
  block: Block;
}

/**
 * Bloco "Sobre" — combina texto (HTML sanitizado via DOMPurify) com
 * imagem opcional. `imageSide` controla se a imagem fica à esquerda
 * ou direita.
 */
export function AboutBlock({ block }: Props) {
  const {
    title = 'Sobre nós',
    html = '',
    imageUrl = '',
    imageSide = 'left',
  } = block.props || {};

  const safeHtml = sanitizeHtml(String(html || ''));

  return (
    <section
      className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl"
      style={{
        marginTop: 'var(--sf-section-spacing)',
        marginBottom: 'var(--sf-section-spacing)',
      }}
    >
      <div
        className={`grid gap-6 items-center ${
          imageUrl ? 'md:grid-cols-2' : 'md:grid-cols-1'
        }`}
      >
        {imageUrl && (
          <div
            className={`relative w-full aspect-video rounded-md overflow-hidden bg-gray-100 ${
              imageSide === 'right' ? 'md:order-2' : 'md:order-1'
            }`}
            style={{ borderRadius: 'var(--sf-radius)' }}
          >
            <Image
              src={getImageUrl(imageUrl)}
              alt={title || 'Sobre'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
        <div className={imageUrl && imageSide === 'right' ? 'md:order-1' : 'md:order-2'}>
          {title && (
            <h2
              className="text-2xl font-semibold mb-3"
              style={{
                color: 'var(--sf-text)',
                fontFamily: 'var(--sf-font-heading)',
              }}
            >
              {title}
            </h2>
          )}
          {safeHtml && (
            <div
              className="text-base leading-relaxed prose prose-sm max-w-none [&_p]:my-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic"
              style={{ color: 'var(--sf-text-muted)' }}
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
