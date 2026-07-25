import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML antes de renderizar via dangerouslySetInnerHTML.
 * Whitelist conservadora: tags semânticas + formatação básica,
 * links com rel seguro, sem scripts/iframes/event handlers inline.
 *
 * Reutilizado pelos blocos (text, about) para renderizar conteúdo
 * produzido pelo editor rich text.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  if (typeof window === 'undefined') {
    // SSR fallback: retorna texto puro para evitar HTML malicioso
    // durante a renderização no servidor (não deve acontecer
    // normalmente, mas previne hydration mismatch).
    return String(html).replace(/<[^>]*>/g, '');
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'span', 'div',
      'blockquote', 'pre', 'code',
      'img',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|whatsapp|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
}
