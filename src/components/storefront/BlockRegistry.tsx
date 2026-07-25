'use client';

import { Block, BlockType } from '@/lib/storefront-types';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { ProductGridBlock } from './blocks/products/ProductGridBlock';
import { ProductCarouselBlock } from './blocks/products/ProductCarouselBlock';
import { FeaturedProductsBlock } from './blocks/products/FeaturedProductsBlock';
import { CategoriesBlock } from './blocks/products/CategoriesBlock';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  category: 'content' | 'product' | 'marketing';
  description: string;
  defaultProps: Record<string, any>;
  Renderer: React.FC<{ block: Block; context?: any }>;
}

/**
 * Registry de blocos. Adicionar um novo bloco = criar um arquivo em
 * ./blocks/ e adicionar uma entrada aqui. O renderer público e o
 * editor leem daqui — sem mudanças no core.
 */
export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  text: {
    type: 'text',
    label: 'Texto',
    category: 'content',
    description: 'Bloco de texto com formatação rica',
    defaultProps: { html: '<p>Edite este texto.</p>', align: 'left', maxWidth: 'md' },
    Renderer: TextBlock as React.FC<{ block: Block; context?: any }>,
  },
  image: {
    type: 'image',
    label: 'Imagem',
    category: 'content',
    description: 'Imagem com legenda e tamanho ajustável',
    defaultProps: { imageUrl: '', alt: '', caption: '', width: 100, rounded: true },
    Renderer: ImageBlock as React.FC<{ block: Block; context?: any }>,
  },
  spacer: {
    type: 'spacer',
    label: 'Espaço',
    category: 'content',
    description: 'Espaço vertical entre seções',
    defaultProps: { height: 40 },
    Renderer: SpacerBlock as React.FC<{ block: Block; context?: any }>,
  },
  product_grid: {
    type: 'product_grid',
    label: 'Grade de produtos',
    category: 'product',
    description: 'Produtos em grade com filtros',
    defaultProps: { title: 'Nossos produtos', columns: 4, category: null, limit: 12, showPrice: true },
    Renderer: ProductGridBlock as React.FC<{ block: Block; context?: any }>,
  },
  product_carousel: {
    type: 'product_carousel',
    label: 'Carrossel de produtos',
    category: 'product',
    description: 'Produtos em carrossel horizontal',
    defaultProps: { title: 'Em destaque', category: null, autoplay: false, limit: 10 },
    Renderer: ProductCarouselBlock as React.FC<{ block: Block; context?: any }>,
  },
  featured_products: {
    type: 'featured_products',
    label: 'Produtos destaque',
    category: 'product',
    description: 'Produtos escolhidos manualmente pelo admin',
    defaultProps: { title: 'Selecionados para você', productIds: [], columns: 4 },
    Renderer: FeaturedProductsBlock as React.FC<{ block: Block; context?: any }>,
  },
  categories: {
    type: 'categories',
    label: 'Categorias',
    category: 'product',
    description: 'Navegação por categoria de produtos',
    defaultProps: { title: 'Categorias', layout: 'pills', showCount: true },
    Renderer: CategoriesBlock as React.FC<{ block: Block; context?: any }>,
  },
  // Tipos ainda não implementados — placeholders amigáveis.
  header: placeholderMeta('Cabeçalho', 'Logo, nome, busca, carrinho (Fase 4)', 'product', { showLogo: true, showName: true, showPhone: true, showCart: true, showSearch: true, transparent: false }),
  hero: placeholderMeta('Banner principal', 'Imagem grande com chamada e CTA (Fase 4)', 'marketing', { imageUrl: '', title: '', subtitle: '', ctaText: '', ctaUrl: '', overlayOpacity: 0.4, textAlign: 'center', height: 'lg' }),
  video: placeholderMeta('Vídeo', 'Embed de YouTube ou Vimeo (Fase 4)', 'content', { provider: 'youtube', videoId: '', aspectRatio: '16:9' }),
  divider: placeholderMeta('Divisor', 'Linha horizontal divisora (Fase 4)', 'content', { style: 'solid', color: '#E5E7EB', width: 100 }),
  promotions: placeholderMeta('Promoções', 'Promoções ativas em carrossel (Fase 4)', 'marketing', { title: 'Promoções', layout: 'carousel' }),
  coupon: placeholderMeta('Cupom', 'Cupom de desconto em destaque (Fase 4)', 'marketing', { code: '', description: '', expiresAt: null, highlight: true }),
  testimonials: placeholderMeta('Depoimentos', 'Avaliações de clientes (Fase 4)', 'marketing', { title: 'O que dizem nossos clientes', items: [] }),
  about: placeholderMeta('Sobre', 'História da empresa (Fase 4)', 'marketing', { title: 'Sobre nós', html: '', imageUrl: '', imageSide: 'left' }),
};

function placeholderMeta(
  label: string,
  description: string,
  category: 'content' | 'product' | 'marketing',
  defaultProps: Record<string, any>,
): BlockDefinition {
  return {
    type: 'text',
    label,
    category,
    description,
    defaultProps,
    Renderer: PlaceholderBlock as React.FC<{ block: Block; context?: any }>,
  };
}

function PlaceholderBlock({ block }: { block: Block }) {
  const def = BLOCK_REGISTRY[block.type];
  return (
    <section
      className="mx-auto px-4 sm:px-6 lg:px-8"
      style={{
        marginTop: 'var(--sf-section-spacing)',
        marginBottom: 'var(--sf-section-spacing)',
      }}
    >
      <div
        className="border-2 border-dashed rounded-md p-6 text-center"
        style={{
          borderColor: 'var(--sf-border)',
          color: 'var(--sf-text-muted)',
          borderRadius: 'var(--sf-radius)',
        }}
      >
        <p className="text-sm font-medium">{def?.label || block.type}</p>
        <p className="text-xs mt-1 opacity-70">Bloco em construção — disponível em breve</p>
      </div>
    </section>
  );
}

export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_REGISTRY[type];
}

export function listAllBlocks(): BlockDefinition[] {
  return Object.values(BLOCK_REGISTRY);
}

export function listBlocksByCategory(category: 'content' | 'product' | 'marketing'): BlockDefinition[] {
  return Object.values(BLOCK_REGISTRY).filter((b) => b.category === category);
}

