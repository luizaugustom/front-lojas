/**
 * URL base da API MontShop (sem barra final).
 * Preferir NEXT_PUBLIC_API_BASE_URL; NEXT_PUBLIC_API_URL é alias legado.
 */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    '';
  const base = raw.replace(/\/+$/, '') || 'http://localhost:3000';
  return base;
}
