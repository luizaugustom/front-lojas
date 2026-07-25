'use client';

import { useMemo } from 'react';
import { Block } from '@/lib/storefront-types';
import { ProductCard, ProductCardData } from '../../shared/ProductCard';
import { useStorefrontData } from '../../StorefrontDataContext';

interface Props {
  block: Block;
}

const COLS_MAP: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  5: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5',
  6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
};

export function ProductGridBlock({ block }: Props) {
  const { title = 'Produtos', columns = 4, category, limit = 12, showPrice = true } = block.props || {};
  const { products, promotedProducts, openProduct } = useStorefrontData();

  const items = useMemo(() => {
    const all = [...(promotedProducts || []), ...(products || [])];
    const filtered = category ? all.filter((p) => (p.category || 'Sem categoria') === category) : all;
    return filtered.slice(0, limit);
  }, [products, promotedProducts, category, limit]);

  if (items.length === 0) {
    return (
      <section
        className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
        style={{
          marginTop: 'var(--sf-section-spacing)',
          marginBottom: 'var(--sf-section-spacing)',
        }}
      >
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-heading)' }}>
          {title}
        </h2>
        <div
          className="border-2 border-dashed rounded-md p-8 text-center text-sm"
          style={{ borderColor: 'var(--sf-border)', color: 'var(--sf-text-muted)' }}
        >
          Nenhum produto{category ? ` em "${category}"` : ''} no momento.
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
        className="text-2xl font-semibold mb-6"
        style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-heading)' }}
      >
        {title}
      </h2>
      <div className={`grid gap-3 ${COLS_MAP[columns] || COLS_MAP[4]}`}>
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={p as ProductCardData}
            variant={columns >= 5 ? 'compact' : 'default'}
            onClick={() => openProduct?.(p)}
          />
        ))}
      </div>
    </section>
  );
}
