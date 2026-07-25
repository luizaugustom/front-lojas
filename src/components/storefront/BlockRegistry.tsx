'use client';

import { Block, BlockType } from '@/lib/storefront-types';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { ProductGridBlock } from './blocks/products/ProductGridBlock';
import { ProductCarouselBlock } from './blocks/products/ProductCarouselBlock';
import { FeaturedProductsBlock } from './blocks/products/FeaturedProductsBlock';
import { CategoriesBlock } from './blocks/products/CategoriesBlock';
import { HeaderBlock } from './blocks/marketing/HeaderBlock';
import { HeroBlock } from './blocks/marketing/HeroBlock';
import { VideoBlock } from './blocks/marketing/VideoBlock';
import { DividerBlock } from './blocks/marketing/DividerBlock';
import { PromotionsBlock } from './blocks/marketing/PromotionsBlock';
import { CouponBlock } from './blocks/marketing/CouponBlock';
import { TestimonialsBlock } from './blocks/marketing/TestimonialsBlock';
import { AboutBlock } from './blocks/marketing/AboutBlock';

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
  header: {
    type: 'header',
    label: 'Cabeçalho',
    category: 'content',
    description: 'Logo, nome e telefone da empresa no topo',
    defaultProps: { showLogo: true, showName: true, showPhone: true, transparent: false },
    Renderer: HeaderBlock as React.FC<{ block: Block; context?: any }>,
  },
  hero: {
    type: 'hero',
    label: 'Banner principal',
    category: 'marketing',
    description: 'Imagem grande com título, subtítulo e botão de ação',
    defaultProps: {
      imageUrl: '',
      title: 'Bem-vindo',
      subtitle: '',
      ctaText: '',
      ctaUrl: '',
      overlayOpacity: 0.4,
      textAlign: 'center',
      height: 'lg',
    },
    Renderer: HeroBlock as React.FC<{ block: Block; context?: any }>,
  },
  text: {
    type: 'text',
    label: 'Texto',
    category: 'content',
    description: 'Bloco de texto com formatação',
    defaultProps: { html: 'Edite este texto.', align: 'left', maxWidth: 'md' },
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
  video: {
    type: 'video',
    label: 'Vídeo',
    category: 'content',
    description: 'Embed de YouTube ou Vimeo',
    defaultProps: { provider: 'youtube', videoId: '', aspectRatio: '16:9' },
    Renderer: VideoBlock as React.FC<{ block: Block; context?: any }>,
  },
  spacer: {
    type: 'spacer',
    label: 'Espaço',
    category: 'content',
    description: 'Espaço vertical entre seções',
    defaultProps: { height: 40 },
    Renderer: SpacerBlock as React.FC<{ block: Block; context?: any }>,
  },
  divider: {
    type: 'divider',
    label: 'Divisor',
    category: 'content',
    description: 'Linha horizontal divisora',
    defaultProps: { style: 'solid', color: '#E5E7EB', width: 100 },
    Renderer: DividerBlock as React.FC<{ block: Block; context?: any }>,
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
  promotions: {
    type: 'promotions',
    label: 'Promoções',
    category: 'marketing',
    description: 'Produtos em promoção em carrossel ou grade',
    defaultProps: { title: 'Promoções', layout: 'carousel' },
    Renderer: PromotionsBlock as React.FC<{ block: Block; context?: any }>,
  },
  coupon: {
    type: 'coupon',
    label: 'Cupom',
    category: 'marketing',
    description: 'Cupom de desconto em destaque com botão de copiar',
    defaultProps: { code: '', description: '', expiresAt: null, highlight: true },
    Renderer: CouponBlock as React.FC<{ block: Block; context?: any }>,
  },
  testimonials: {
    type: 'testimonials',
    label: 'Depoimentos',
    category: 'marketing',
    description: 'Avaliações de clientes com foto e nota',
    defaultProps: { title: 'O que dizem nossos clientes', items: [] },
    Renderer: TestimonialsBlock as React.FC<{ block: Block; context?: any }>,
  },
  about: {
    type: 'about',
    label: 'Sobre',
    category: 'marketing',
    description: 'História da empresa com texto e imagem',
    defaultProps: { title: 'Sobre nós', html: '', imageUrl: '', imageSide: 'left' },
    Renderer: AboutBlock as React.FC<{ block: Block; context?: any }>,
  },
};

export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_REGISTRY[type];
}

export function listAllBlocks(): BlockDefinition[] {
  return Object.values(BLOCK_REGISTRY);
}

export function listBlocksByCategory(category: 'content' | 'product' | 'marketing'): BlockDefinition[] {
  return Object.values(BLOCK_REGISTRY).filter((b) => b.category === category);
}
