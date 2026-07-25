'use client';

import { Block, BlockType } from '@/lib/storefront-types';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { SpacerBlock } from './blocks/SpacerBlock';

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
  // Os tipos abaixo são registrados apenas com metadata; os renderers
  // serão implementados nas Fases 3 e 4. Renderizam um placeholder
  // amigável até lá.
  header: placeholderMeta('Cabeçalho', 'Logo, nome, busca, carrinho', 'product', { showLogo: true, showName: true, showPhone: true, showCart: true, showSearch: true, transparent: false }),
  hero: placeholderMeta('Banner principal', 'Imagem grande com chamada e CTA', 'marketing', { imageUrl: '', title: '', subtitle: '', ctaText: '', ctaUrl: '', overlayOpacity: 0.4, textAlign: 'center', height: 'lg' }),
  video: placeholderMeta('Vídeo', 'Embed de YouTube ou Vimeo', 'content', { provider: 'youtube', videoId: '', aspectRatio: '16:9' }),
  divider: placeholderMeta('Divisor', 'Linha horizontal divisora', 'content', { style: 'solid', color: '#E5E7EB', width: 100 }),
  product_grid: placeholderMeta('Grade de produtos', 'Produtos em grade', 'product', { title: 'Produtos', columns: 4, category: null, limit: 12, showPrice: true }),
  product_carousel: placeholderMeta('Carrossel de produtos', 'Produtos em carrossel', 'product', { title: 'Em destaque', category: null, autoplay: false, limit: 10 }),
  featured_products: placeholderMeta('Produtos destaque', 'Produtos escolhidos manualmente', 'product', { title: 'Selecionados para você', productIds: [], columns: 4 }),
  categories: placeholderMeta('Categorias', 'Navegação por categoria', 'product', { title: 'Categorias', layout: 'pills', showCount: true }),
  promotions: placeholderMeta('Promoções', 'Promoções ativas em carrossel', 'marketing', { title: 'Promoções', layout: 'carousel' }),
  coupon: placeholderMeta('Cupom', 'Cupom de desconto em destaque', 'marketing', { code: '', description: '', expiresAt: null, highlight: true }),
  testimonials: placeholderMeta('Depoimentos', 'Avaliações de clientes', 'marketing', { title: 'O que dizem nossos clientes', items: [] }),
  about: placeholderMeta('Sobre', 'História da empresa', 'marketing', { title: 'Sobre nós', html: '', imageUrl: '', imageSide: 'left' }),
};

function placeholderMeta(
  label: string,
  description: string,
  category: 'content' | 'product' | 'marketing',
  defaultProps: Record<string, any>,
): BlockDefinition {
  return {
    type: 'text', // será sobrescrito
    label,
    category,
    description,
    defaultProps,
    Renderer: PlaceholderBlock as React.FC<{ block: Block; context?: any }>,
  };
}

/**
 * Placeholder genérico para blocos ainda não implementados.
 * Mostra um aviso sutil de "bloco em construção" no renderer público
 * e um preview real quando o tipo for implementado.
 */
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

/**
 * Retorna a definição de um bloco pelo tipo. Útil para o editor
 * mostrar label, ícone, descrição no palette e no properties panel.
 */
export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_REGISTRY[type];
}

/**
 * Lista todos os blocos disponíveis para o palette do editor.
 */
export function listAllBlocks(): BlockDefinition[] {
  return Object.values(BLOCK_REGISTRY);
}

/**
 * Lista os blocos por categoria (content, product, marketing).
 */
export function listBlocksByCategory(category: 'content' | 'product' | 'marketing'): BlockDefinition[] {
  return Object.values(BLOCK_REGISTRY).filter((b) => b.category === category);
}
