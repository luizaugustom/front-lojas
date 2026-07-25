'use client';

import { createContext, useContext } from 'react';

export interface StorefrontProduct {
  id: string;
  name: string;
  photos: string[];
  price: string;
  stockQuantity: number;
  size?: string | null;
  category?: string | null;
  description?: string | null;
  unitOfMeasure?: string | null;
  originalPrice?: string;
  promotionPrice?: string;
  promotionDiscount?: number;
  isOnPromotion?: boolean;
  promotionName?: string;
}

export interface StorefrontData {
  products: StorefrontProduct[];
  promotedProducts: StorefrontProduct[];
  openProduct?: (p: StorefrontProduct) => void;
  onCategoryClick?: (category: string) => void;
}

const StorefrontDataContext = createContext<StorefrontData | null>(null);

export const StorefrontDataProvider = StorefrontDataContext.Provider;

/**
 * Hook para blocos de produto acessarem produtos + handlers do
 * contexto do storefront (definido pelo CatalogPageClient).
 */
export function useStorefrontData(): StorefrontData {
  const ctx = useContext(StorefrontDataContext);
  if (!ctx) {
    return { products: [], promotedProducts: [] };
  }
  return ctx;
}
