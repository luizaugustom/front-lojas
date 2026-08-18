'use client';

import type { BasicCatalogCompany } from '@/hooks/useBasicCatalog';
import type { BasicCatalogProductsResponse } from '@/hooks/useBasicCatalog';
import { ProductCard } from './ProductCard';

type Props = {
  company: BasicCatalogCompany;
  data: BasicCatalogProductsResponse;
};

export function ProductGrid({ company, data }: Props) {
  const { products } = data;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          product={p}
          key={p.id}
          brandColor={company.brandColor}
        />
      ))}
    </div>
  );
}