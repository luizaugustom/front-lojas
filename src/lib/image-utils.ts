/**
 * Utilitários para trabalhar com URLs de imagens
 * Suporta URLs do DigitalOcean Spaces, Firebase Storage (legado) e caminhos relativos
 */

import { logger } from '@/lib/logger';
import { getApiBaseUrl } from '@/lib/api-base-url';

/**
 * Constrói a URL completa para uma imagem
 * Suporta URLs absolutas (DO Spaces, Firebase Storage) e caminhos relativos
 * @param url - URL relativa ou absoluta da imagem
 * @returns URL completa da imagem
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  const cleanUrl = url.trim();
  
  // URLs absolutas (DO Spaces, Firebase Storage, ou qualquer CDN) — usar como está
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  
  // Caminho relativo — construir URL com base na API
  const baseUrl = getApiBaseUrl();
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const fullUrl = `${cleanBaseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
  
  logger.log('🔍 [getImageUrl] Construindo URL:', { 
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

