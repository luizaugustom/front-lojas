/**
 * Utilitários para trabalhar com URLs de imagens
 */

/**
 * Constrói a URL completa para uma imagem
 * Suporta URLs do Firebase Storage e URLs locais
 * @param url - URL relativa ou absoluta da imagem
 * @returns URL completa da imagem
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // Limpar espaços e caracteres indesejados
  const cleanUrl = url.trim();
  
  // Se já é uma URL completa (Firebase Storage ou outro CDN), usar como está
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  
  // Se é um caminho relativo (antigo sistema de upload local), construir URL completa
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  // Remover barra final da baseUrl se existir
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Garantir que a URL final tenha apenas uma barra entre base e path
  const fullUrl = `${cleanBaseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
  
  console.log('🔍 [getImageUrl] Construindo URL:', { 
    input: url, 
    cleanUrl, 
    baseUrl: cleanBaseUrl, 
    output: fullUrl 
  });
  
  return fullUrl;
}

/**
 * Verifica se uma URL de imagem é válida
 * @param url - URL da imagem
 * @returns true se a URL é válida
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  if (url === 'null' || url === 'undefined') return false;
  return true;
}

/**
 * Obtém a primeira imagem válida de um array de URLs
 * @param photos - Array de URLs de fotos
 * @returns URL completa da primeira imagem válida ou string vazia
 */
export function getFirstValidImageUrl(photos: string[] | undefined | null): string {
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return '';
  }
  
  const firstPhoto = photos[0];
  if (!isValidImageUrl(firstPhoto)) {
    return '';
  }
  
  return getImageUrl(firstPhoto);
}

