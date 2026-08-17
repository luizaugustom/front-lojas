/**
 * Tipos do storefront público. Espelham os tipos do backend
 * (api-lojas/src/application/storefront/blocks/*).
 *
 * Qualquer alteração aqui deve ser sincronizada com o backend.
 */

export const BLOCK_TYPES = [
  'header',
  'hero',
  'text',
  'image',
  'video',
  'spacer',
  'divider',
  'product_grid',
  'product_carousel',
  'featured_products',
  'categories',
  'promotions',
  'coupon',
  'testimonials',
  'about',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export interface Block {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;
  props: Record<string, any>;
}

export interface StorefrontTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  spacing: 'compact' | 'normal' | 'relaxed';
}

export const DEFAULT_THEME: StorefrontTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#F59E0B',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  borderRadius: 'md',
  spacing: 'normal',
};

export interface StorefrontCompany {
  id: string;
  name: string;
  fantasyName?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  address: string;
}

export interface PublicStorefrontResponse {
  company: StorefrontCompany;
  theme: StorefrontTheme;
  blocks: Block[];
  publishedAt: string | null;
  needsSetup?: boolean;
}

// ───────────────────────────────────────────────────────────────
// Catálogo simplificado (3 templates prontos)
// ───────────────────────────────────────────────────────────────

export type CatalogTemplateId = 'CLASSIC' | 'MODERN' | 'BOLD';

export type CatalogTexts = {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutBody: string;
  contactPhone: string;
  contactEmail: string;
  footerText: string;
};

export type CatalogColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
};

export type CatalogConfig = {
  id: string;
  companyId: string;
  templateId: CatalogTemplateId;
  logoUrl: string | null;
  heroImageUrl: string | null;
  texts: CatalogTexts;
  colors: CatalogColors;
};

export type UpdateCatalogConfigPayload = {
  templateId?: CatalogTemplateId;
  texts?: Partial<CatalogTexts>;
};
