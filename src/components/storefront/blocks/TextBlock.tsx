'use client';

import { Block } from '@/lib/storefront-types';
import { sanitizeHtml } from '../shared/safe-html';

interface TextBlockProps {
  block: Block;
}

const ALIGN_CLASS: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const MAX_WIDTH_CLASS: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  full: 'max-w-none',
};

/**
 * Bloco de texto com HTML sanitizado via DOMPurify antes de renderizar.
 * O HTML vem do RichTextEditor do admin; o sanitizador remove scripts,
 * event handlers inline, iframes e outras tags perigosas.
 */
export function TextBlock({ block }: TextBlockProps) {
  const { html = '', align = 'left', maxWidth = 'md' } = block.props || {};

  const safe = sanitizeHtml(String(html));

  if (!safe) {
    return (
      <section
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          marginTop: 'var(--sf-section-spacing)',
          marginBottom: 'var(--sf-section-spacing)',
        }}
      >
        <div
          className={`mx-auto ${MAX_WIDTH_CLASS[maxWidth] || MAX_WIDTH_CLASS.md} ${ALIGN_CLASS[align] || ALIGN_CLASS.left}`}
        >
          <p className="text-sm text-gray-400 italic">Bloco de texto vazio</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto px-4 sm:px-6 lg:px-8"
      style={{
        marginTop: 'var(--sf-section-spacing)',
        marginBottom: 'var(--sf-section-spacing)',
      }}
    >
      <div
        className={`mx-auto ${MAX_WIDTH_CLASS[maxWidth] || MAX_WIDTH_CLASS.md} ${ALIGN_CLASS[align] || ALIGN_CLASS.left} prose prose-sm max-w-none [&_p]:my-1.5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-blue-600 [&_a]:underline`}
        style={{ color: 'var(--sf-text)' }}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    </section>
  );
}
