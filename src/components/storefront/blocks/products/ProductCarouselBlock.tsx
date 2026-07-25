'use client';

import { useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Block } from '@/lib/storefront-types';
import { ProductCard, ProductCardData } from '../../shared/ProductCard';
import { useStorefrontData } from '../../StorefrontDataContext';

interface Props {
  block: Block;
}

export function ProductCarouselBlock({ block }: Props) {
  const { title = 'Em destaque', category, autoplay = false, limit = 10 } = block.props || {};
  const { products, promotedProducts, openProduct } = useStorefrontData();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const all = [...(promotedProducts || []), ...(products || [])];
    const filtered = category ? all.filter((p) => (p.category || 'Sem categoria') === category) : all;
    return filtered.slice(0, limit);
  }, [products, promotedProducts, category, limit]);

  // Autoplay simples
  useEffect(() => {
    if (!autoplay) return;
    const el = scrollerRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
      }
    }, 4000);
    return () => clearInterval(id);
  }, [autoplay, items.length]);

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section
      className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative"
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
      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 hover:scale-105 transition"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {items.map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-44">
              <ProductCard
                product={p as ProductCardData}
                variant="default"
                onClick={() => openProduct?.(p)}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll(1)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 hover:scale-105 transition"
          aria-label="Próximo"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
