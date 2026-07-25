'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { Block } from '@/lib/storefront-types';
import { getImageUrl } from '@/lib/image-utils';

export interface TestimonialItem {
  name: string;
  text: string;
  avatarUrl?: string;
  rating?: number;
}

interface Props {
  block: Block;
}

/**
 * Bloco de depoimentos. `items` é um array de {name, text, avatarUrl, rating}.
 */
export function TestimonialsBlock({ block }: Props) {
  const { title = 'O que dizem nossos clientes', items = [] } = block.props || {};

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <section
        className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl"
        style={{
          marginTop: 'var(--sf-section-spacing)',
          marginBottom: 'var(--sf-section-spacing)',
        }}
      >
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-heading)' }}
        >
          {title}
        </h2>
        <div
          className="border-2 border-dashed rounded-md p-8 text-center text-sm"
          style={{
            borderColor: 'var(--sf-border)',
            color: 'var(--sf-text-muted)',
          }}
        >
          Nenhum depoimento cadastrado. Adicione depoimentos no editor.
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
      style={{
        marginTop: 'var(--sf-section-spacing)',
        marginBottom: 'var(--sf-section-spacing)',
      }}
    >
      <h2
        className="text-2xl font-semibold mb-6 text-center"
        style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-heading)' }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t: TestimonialItem, i: number) => (
          <div
            key={i}
            className="p-5 border rounded-md"
            style={{
              borderRadius: 'var(--sf-radius)',
              backgroundColor: 'var(--sf-surface)',
              borderColor: 'var(--sf-border)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              {t.avatarUrl ? (
                <div className="relative h-10 w-10 flex-shrink-0">
                  <Image
                    src={getImageUrl(t.avatarUrl)}
                    alt={t.name || ''}
                    fill
                    className="object-cover rounded-full"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm"
                  style={{
                    backgroundColor: 'var(--sf-primary)',
                    color: '#fff',
                  }}
                >
                  {(t.name || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p
                  className="font-medium text-sm truncate"
                  style={{ color: 'var(--sf-text)' }}
                >
                  {t.name || 'Anônimo'}
                </p>
                {typeof t.rating === 'number' && t.rating > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="h-3 w-3"
                        fill={idx < t.rating! ? 'currentColor' : 'none'}
                        style={{
                          color:
                            idx < t.rating!
                              ? 'var(--sf-accent)'
                              : 'var(--sf-border)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--sf-text-muted)' }}
            >
              "{t.text || ''}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
