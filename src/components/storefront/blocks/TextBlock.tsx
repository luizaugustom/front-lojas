'use client';

import { Block } from '@/lib/storefront-types';

interface TextBlockProps {
  block: Block;
}

const alignMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const maxWidthMap: Record<string, string> = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  full: 'max-w-none',
};

/**
 * Bloco de texto. Por enquanto renderiza o HTML escapado como texto
 * puro (Fase 1). Quando o editor rich-text entrar (Fase 5), vamos
 * instalar DOMPurify para sanitizar o HTML vindo do editor antes de
 * usar dangerouslySetInnerHTML.
 *
 * O fallback seguro evita XSS enquanto não temos a pipeline de
 * sanitização completa.
 */
export function TextBlock({ block }: TextBlockProps) {
  const { html = '', align = 'left', maxWidth = 'md' } = block.props || {};

  // Strip tags básicos para mostrar o conteúdo como texto puro nesta fase.
  // Quando o rich text editor entrar, trocamos por sanitize(html).
  const plainText = String(html).replace(/<[^>]*>/g, '').trim();

  return (
    <section
      className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthMap[maxWidth] || maxWidthMap.md} ${alignMap[align] || alignMap.left}`}
      style={{
        marginTop: 'var(--sf-section-spacing)',
        marginBottom: 'var(--sf-section-spacing)',
      }}
    >
      {plainText ? (
        <p
          className="text-base leading-relaxed whitespace-pre-line"
          style={{ color: 'var(--sf-text)' }}
        >
          {plainText}
        </p>
      ) : (
        <p
          className="text-sm italic"
          style={{ color: 'var(--sf-text-muted)' }}
        >
          (Texto vazio — edite no painel)
        </p>
      )}
    </section>
  );
}
