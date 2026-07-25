'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Block } from '@/lib/storefront-types';
import { getImageUrl } from '@/lib/image-utils';

interface Props {
  block: Block;
}

const HEIGHT_CLASS: Record<string, string> = {
  sm: 'h-64 sm:h-80',
  md: 'h-80 sm:h-96',
  lg: 'h-96 sm:h-[28rem]',
  xl: 'h-[28rem] sm:h-[36rem]',
};

const ALIGN_CLASS: Record<string, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

/**
 * Bloco hero com imagem de fundo, título, subtítulo e CTA. O overlay
 * escuro melhora contraste do texto quando a imagem é clara.
 */
export function HeroBlock({ block }: Props) {
  const {
    imageUrl,
    title = '',
    subtitle = '',
    ctaText = '',
    ctaUrl = '',
    overlayOpacity = 0.4,
    textAlign = 'center',
    height = 'lg',
  } = block.props || {};

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        marginTop: 'var(--sf-section-spacing)',
        marginBottom: 'var(--sf-section-spacing)',
      }}
    >
      <div
        className={`relative w-full ${HEIGHT_CLASS[height] || HEIGHT_CLASS.lg}`}
      >
        {imageUrl ? (
          <Image
            src={getImageUrl(imageUrl)}
            alt={title || 'Banner'}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'var(--sf-secondary)' }}
          />
        )}
        {imageUrl && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        )}
        <div
          className={`relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 ${ALIGN_CLASS[textAlign] || ALIGN_CLASS.center}`}
        >
          <div className="max-w-2xl mx-auto w-full">
            {title && (
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-white"
                style={{ fontFamily: 'var(--sf-font-heading)' }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-base sm:text-lg text-white/90 mb-5">{subtitle}</p>
            )}
            {ctaText && ctaUrl && (
              <Link
                href={ctaUrl}
                className="inline-block px-5 py-2.5 rounded-md font-medium text-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--sf-primary)',
                  color: '#fff',
                  borderRadius: 'var(--sf-radius)',
                }}
              >
                {ctaText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
