/**
 * URL base da API MontShop (sem barra final).
 *
 * No browser usamos /api-backend (proxy same-origin na Vercel/Next) para evitar
 * CORS com withCredentials. No servidor (SSR) usamos a URL direta da API.
 */
const API_PROXY_PATH = '/api-backend';
const DEFAULT_DIRECT_API = 'https://api.montshop.app';

function getConfiguredDirectUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ''
  ).replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  const configured = getConfiguredDirectUrl();
  const directUrl = configured || DEFAULT_DIRECT_API;
  const useProxy = process.env.NEXT_PUBLIC_USE_API_PROXY !== 'false';

  // Browser: same-origin proxy (sem preflight cross-origin)
  if (typeof window !== 'undefined' && useProxy) {
    return API_PROXY_PATH;
  }

  // SSR / scripts Node
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_DIRECT_API;
  }

  return 'http://localhost:3000';
}

export function getDirectApiBaseUrl(): string {
  const configured = getConfiguredDirectUrl();
  return configured || DEFAULT_DIRECT_API;
}
