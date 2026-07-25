'use client';

import { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { Block } from '@/lib/storefront-types';
import { useStorefrontData } from '../../StorefrontDataContext';

interface Props {
  block: Block;
}

/**
 * Bloco de navegação por categoria. Lista as categorias distintas
 * dos produtos, com contagem. O admin pode filtrar o storefront
 * inteiro por categoria no futuro (Fase 7).
 */
export function CategoriesBlock({ block }: Props) {
  const { title = 'Categorias', layout = 'pills', showCount = true } = block.props || {};
  const { products, promotedProducts, onCategoryClick } = useStorefrontData();

  const categories = useMemo(() => {
    const all = [...(promotedProducts || []), ...(products || [])];
    const counts = new Map<string, number>();
    for (const p of all) {
      const c = p.category || 'Sem categoria';
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, promotedProducts]);

  if (categories.length === 0) return null;

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
      {layout === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => onCategoryClick?.(c.name)}
              className="flex items-center gap-2 p-3 border bg-white hover:shadow-sm transition text-left"
              style={{ borderColor: 'var(--sf-border)', borderRadius: 'var(--sf-radius)' }}
            >
              <Tag className="h-4 w-4" style={{ color: 'var(--sf-primary)' }} />
              <span className="flex-1 truncate text-sm font-medium" style={{ color: 'var(--sf-text)' }}>
                {c.name}
              </span>
              {showCount && (
                <span className="text-xs text-gray-500">({c.count})</span>
              )}
            </button>
          ))}
        </div>
      ) : layout === 'list' ? (
        <ul className="divide-y" style={{ borderColor: 'var(--sf-border)' }}>
          {categories.map((c) => (
            <li key={c.name}>
              <button
                onClick={() => onCategoryClick?.(c.name)}
                className="w-full flex items-center justify-between py-2 px-3 hover:bg-gray-50 transition text-left"
              >
                <span className="text-sm" style={{ color: 'var(--sf-text)' }}>{c.name}</span>
                {showCount && (
                  <span className="text-xs text-gray-500">{c.count} produto(s)</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => onCategoryClick?.(c.name)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border bg-white hover:shadow-sm transition"
              style={{
                borderColor: 'var(--sf-border)',
                color: 'var(--sf-text)',
                borderRadius: 'var(--sf-radius)',
              }}
            >
              {c.name}
              {showCount && (
                <span className="text-xs text-gray-400">({c.count})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
