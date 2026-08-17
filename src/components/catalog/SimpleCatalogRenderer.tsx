'use client';

import type { CatalogConfig } from '@/lib/storefront-types';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { BoldTemplate } from './templates/BoldTemplate';

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  description?: string | null;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogCompany = {
  id: string;
  name: string;
  fantasyName?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  zipCode?: string | null;
  state?: string | null;
  city?: string | null;
  district?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
};

type Props = {
  config: CatalogConfig;
  company: CatalogCompany;
  products?: CatalogProduct[];
  categories?: CatalogCategory[];
};

export function SimpleCatalogRenderer({
  config,
  company,
  products = [],
  categories = [],
}: Props) {
  switch (config.templateId) {
    case 'MODERN':
      return (
        <ModernTemplate
          config={config}
          company={company}
          products={products}
          categories={categories}
        />
      );
    case 'BOLD':
      return (
        <BoldTemplate
          config={config}
          company={company}
          products={products}
          categories={categories}
        />
      );
    case 'CLASSIC':
    default:
      return (
        <ClassicTemplate
          config={config}
          company={company}
          products={products}
          categories={categories}
        />
      );
  }
}
