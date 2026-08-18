'use client';

import type { BasicCatalogCompany } from '@/hooks/useBasicCatalog';
import type { BasicCatalogProductsResponse } from '@/hooks/useBasicCatalog';
import { ProductCard } from './ProductCard';

type Props = {
  company: BasicCatalogCompany;
  data: BasicCatalogProductsResponse;
  onOpenProduct: (productId: string) => void;
};

export function ProductGrid({ company, data, onOpenProduct }: Props) {
  const { products } = data;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          product={p}
          key={p.id}
          brandColor={company.brandColor}
          onOpen={() => onOpenProduct(p.id)}
        />
      ))}
    </div>
  );
}