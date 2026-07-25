'use client';

import { Block } from '@/lib/storefront-types';
import { ProductCard, ProductCardData } from '../../shared/ProductCard';
import { useStorefrontData, StorefrontProduct } from '../../StorefrontDataContext';

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

/**
 * Bloco de produtos em destaque — IDs selecionados manualmente pelo
 * admin no editor. Se a lista vier vazia, mostra fallback com aviso.
 */
export function FeaturedProductsBlock({ block }: Props) {
  const { title = 'Selecionados para você', productIds = [], columns = 4 } = block.props || {};
  const { products, promotedProducts, openProduct } = useStorefrontData();

  const items = (() => {
    if (!Array.isArray(productIds) || productIds.length === 0) return [];
    const all = [...(promotedProducts || []), ...(products || [])];
    const map = new Map(all.map((p) => [p.id, p]));
    return productIds
      .map((id) => map.get(id))
      .filter((p): p is StorefrontProduct => Boolean(p))
      .map((p) => ({
        ...p,
        stockQuantity: p.stockQuantity ?? 0,
      })) as ProductCardData[];
  })();

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
      {items.length === 0 ? (
        <div
          className="border-2 border-dashed rounded-md p-8 text-center text-sm"
          style={{ borderColor: 'var(--sf-border)', color: 'var(--sf-text-muted)' }}
        >
          Nenhum produto selecionado. Edite este bloco para escolher.
        </div>
      ) : (
        <div className={`grid gap-3 ${COLS_MAP[columns] || COLS_MAP[4]}`}>
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              variant={columns >= 5 ? 'compact' : 'default'}
              onClick={() => openProduct?.(p as StorefrontProduct)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
