/**
 * Constantes para upload de arquivos no frontend
 */

// Limite de fotos por produto
export const MAX_PRODUCT_PHOTOS = 3;

// Tipos de arquivo aceitos (para input)
export const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

// String para atributo accept do input
export const ACCEPTED_IMAGE_STRING = 'image/jpeg,image/jpg,image/png,image/webp,image/gif';

// Tamanho máximo por arquivo (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Mensagens de erro
export const UPLOAD_ERROR_MESSAGES = {
  TOO_MANY_FILES: `Você pode adicionar no máximo ${MAX_PRODUCT_PHOTOS} fotos por produto`,
  FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo: 5MB',
  INVALID_TYPE: 'Tipo de arquivo inválido. Use apenas imagens (JPG, PNG, WEBP, GIF)',
};

/**
 * Valida se um arquivo é uma imagem válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: UPLOAD_ERROR_MESSAGES.INVALID_TYPE };
  }

  // Validar tamanho
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: UPLOAD_ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  return { valid: true };
}

/**
 * Formata o tamanho do arquivo em formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

