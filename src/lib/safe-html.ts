/**
 * Utilitário para renderizar HTML de forma segura (mitigação de XSS).
 * Use sempre que o conteúdo puder vir de API ou input do usuário.
 * Para conteúdo estático controlado (ex.: termos no código), a sanitização é opcional mas recomendada.
 */

const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ON_EVENT_REGEX = /\s*on\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_PROTOCOL = /javascript:/gi;

/**
 * Remove scripts, atributos de evento e protocolo javascript do HTML.
 * Use para conteúdo que pode vir de API no futuro.
 * Para máxima proteção com conteúdo dinâmico, considere adicionar DOMPurify.
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  return html
    .replace(SCRIPT_REGEX, '')
    .replace(ON_EVENT_REGEX, '')
    .replace(JAVASCRIPT_PROTOCOL, '');
}

/**
 * Processa markdown/HTML e retorna HTML sanitizado para uso em dangerouslySetInnerHTML.
 * Conteúdo estático no código é seguro; se no futuro o conteúdo vier da API, use esta função.
 */
export function renderSafeMarkdown(markdown: string, processMarkdown: (text: string) => string): string {
  const raw = processMarkdown(markdown);
  return sanitizeHtml(raw);
}
