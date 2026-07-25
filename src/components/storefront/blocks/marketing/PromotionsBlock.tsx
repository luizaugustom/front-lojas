'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Block } from '@/lib/storefront-types';
import { useStorefrontData } from '../../StorefrontDataContext';
import { getImageUrl } from '@/lib/image-utils';

interface Props {
  block: Block;
}

/**
 * Bloco de promoções: carrossel horizontal (default) ou grid.
 * Usa os produtos marcados como promoção (`isOnPromotion`) do data context.
 */
export function PromotionsBlock({ block }: Props) {
  const { title = 'Promoções', layout = 'carousel' } = block.props || {};
  const { promotedProducts, openProduct } = useStorefrontData();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function checkScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [promotedProducts.length]);

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  if (!promotedProducts || promotedProducts.length === 0) {
    return (
      <section
        className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
        style={{
          marginTop: 'var(--sf-section-spacing)',
          marginBottom: 'var(--sf-section-spacing)',
        }}
      >
        <div
          className="border-2 border-dashed rounded-md p-6 text-center text-sm flex items-center justify-center gap-2"
          style={{
            borderColor: 'var(--sf-border)',
            color: 'var(--sf-text-muted)',
          }}
        >
          <Tag className="h-4 w-4" />
          Sem promoções ativas no momento.
        </div>
      </section>
    );
  }

  if (layout === 'grid') {
    return (
      <section
        className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {promotedProducts.slice(0, 8).map((p) => (
            <PromotionCard key={p.id} product={p} onClick={() => openProduct?.(p)} />
          ))}
        </div>
      </section>
    );
  }

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
        {canScrollLeft && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/95 border rounded-full shadow hover:bg-white"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/95 border rounded-full shadow hover:bg-white"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin' }}
        >
          {promotedProducts.map((p) => (
            <div key={p.id} className="snap-start flex-shrink-0 w-44 sm:w-52">
              <PromotionCard product={p} onClick={() => openProduct?.(p)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromotionCard({
  product,
  onClick,
}: {
  product: ReturnType<typeof useStorefrontData>['promotedProducts'][number];
  onClick: () => void;
}) {
  const discountPct =
    product.originalPrice && product.promotionPrice && Number(product.originalPrice) > 0
      ? Math.round(
          ((Number(product.originalPrice) - Number(product.promotionPrice)) /
            Number(product.originalPrice)) *
            100,
        )
      : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border rounded-md overflow-hidden hover:shadow-md transition-shadow"
      style={{
        borderRadius: 'var(--sf-radius)',
        borderColor: 'var(--sf-border)',
      }}
    >
      <div className="relative aspect-square bg-gray-50">
        {product.photos?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getImageUrl(product.photos[0])}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            sem foto
          </div>
        )}
        {discountPct && discountPct > 0 && (
          <span
            className="absolute top-1.5 left-1.5 text-xs font-bold px-2 py-0.5 rounded text-white"
            style={{ backgroundColor: 'var(--sf-accent)' }}
          >
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs line-clamp-2 mb-1" style={{ color: 'var(--sf-text)' }}>
          {product.name}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold" style={{ color: 'var(--sf-accent)' }}>
            R$ {Number(product.promotionPrice || product.price).toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > (product.promotionPrice || 0) && (
            <span className="text-[10px] text-gray-400 line-through">
              R$ {Number(product.originalPrice).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
