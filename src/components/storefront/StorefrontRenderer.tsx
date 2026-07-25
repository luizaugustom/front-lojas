'use client';

import { Block, StorefrontTheme } from '@/lib/storefront-types';
import { BLOCK_REGISTRY } from './BlockRegistry';
import { ThemeProvider } from './ThemeProvider';
import { StorefrontData, StorefrontDataProvider } from './StorefrontDataContext';

interface StorefrontRendererProps {
  blocks: Block[];
  theme: StorefrontTheme;
  data?: StorefrontData;
}

/**
 * Renderer público do storefront. Itera os blocos em `blocks` (já
 * ordenado pelo backend) e delega ao componente registrado no
 * BlockRegistry. Envolvido pelo ThemeProvider que injeta as CSS vars
 * do tema, e pelo StorefrontDataProvider que dá aos blocos acesso a
 * produtos/promoções/handlers.
 *
 * Componentes do storefront devem usar as vars `var(--sf-*)` em vez
 * de cores hard-coded — assim o tema da empresa se propaga.
 */
export function StorefrontRenderer({ blocks, theme, data }: StorefrontRendererProps) {
  return (
    <ThemeProvider theme={theme}>
      <StorefrontDataProvider value={data || { products: [], promotedProducts: [] }}>
        <div
          className="min-h-screen"
          style={{
            backgroundColor: 'var(--sf-background)',
            color: 'var(--sf-text)',
            fontFamily: 'var(--sf-font-body)',
          }}
        >
          {blocks
            .filter((b) => b && b.visible !== false)
            .map((block) => {
              const def = BLOCK_REGISTRY[block.type];
              if (!def) {
                return null;
              }
              const Renderer = def.Renderer;
              return <Renderer key={block.id} block={block} />;
            })}
        </div>
      </StorefrontDataProvider>
    </ThemeProvider>
  );
}
