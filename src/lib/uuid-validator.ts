/**
 * Utilitários para validação de UUID v4 no frontend
 * Mantém consistência com a validação do backend
 */

/**
 * Regex para validar UUID v4 estrito
 * Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Onde y é 8, 9, a, ou b
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Valida se uma string é um UUID v4 válido
 * @param value - String para validar
 * @returns true se for um UUID v4 válido
 */
export function isValidUUID(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  
  return UUID_V4_REGEX.test(value);
}

/**
 * Valida se um array contém apenas UUIDs v4 válidos
 * @param values - Array de strings para validar
 * @returns true se todos forem UUIDs v4 válidos
 */
export function isValidUUIDArray(values: string[] | null | undefined): boolean {
  if (!values || !Array.isArray(values)) {
    return false;
  }
  
  return values.every(value => isValidUUID(value));
}

/**
 * Valida e retorna o UUID ou lança erro
 * @param value - String para validar
 * @param fieldName - Nome do campo (para mensagem de erro)
 * @returns O UUID validado
 * @throws Error se o UUID for inválido
 */
export function validateUUID(value: string | null | undefined, fieldName: string = 'ID'): string {
  if (!value) {
    throw new Error(`${fieldName} é obrigatório`);
  }
  
  if (!isValidUUID(value)) {
    throw new Error(
      `${fieldName} inválido: ${value}. Esperado formato UUID v4 válido (ex: 550e8400-e29b-41d4-a716-446655440000)`
    );
  }
  
  return value;
}

/**
 * Formata UUID para exibição amigável
 * @param uuid - UUID completo
 * @param length - Número de caracteres para mostrar (padrão: 8)
 * @returns UUID truncado com "..."
 */
export function formatUUIDForDisplay(uuid: string | null | undefined, length: number = 8): string {
  if (!uuid) return 'N/A';
  
  if (!isValidUUID(uuid)) {
    return 'UUID Inválido';
  }
  
  if (uuid.length <= length) {
    return uuid;
  }
  
  return `${uuid.substring(0, length)}...`;
}

/**
 * Gera um UUID v4 válido (para uso em criação de registros temporários no frontend)
 * @returns UUID v4 gerado
 */
export function generateUUID(): string {
  // Implementação baseada em crypto.randomUUID() quando disponível
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para navegadores mais antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Hook de validação para React Hook Form
 * @param required - Se o campo é obrigatório
 * @returns Objeto de validação para React Hook Form
 */
export function uuidValidationRules(required: boolean = true) {
  return {
    required: required ? 'Campo obrigatório' : false,
    validate: {
      isUUID: (value: string) => {
        if (!value && !required) return true;
        return isValidUUID(value) || 'UUID inválido. Formato esperado: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
      },
    },
  };
}

/**
 * Valida se um objeto tem propriedade ID válida
 * @param obj - Objeto para validar
 * @returns true se o objeto tem ID válido
 */
export function hasValidId(obj: any): obj is { id: string } {
  return obj && typeof obj === 'object' && 'id' in obj && isValidUUID(obj.id);
}

/**
 * Filtra array removendo itens com IDs inválidos
 * @param items - Array de objetos com propriedade id
 * @returns Array filtrado apenas com IDs válidos
 */
export function filterValidIds<T extends { id: string }>(items: T[]): T[] {
  return items.filter(item => isValidUUID(item.id));
}

/**
 * Compara dois UUIDs (case-insensitive)
 * @param uuid1 - Primeiro UUID
 * @param uuid2 - Segundo UUID
 * @returns true se forem iguais
 */
export function areUUIDsEqual(
  uuid1: string | null | undefined,
  uuid2: string | null | undefined
): boolean {
  if (!uuid1 || !uuid2) return false;
  return uuid1.toLowerCase() === uuid2.toLowerCase();
}

/**
 * Extrai UUIDs de uma string de texto
 * @param text - Texto contendo UUIDs
 * @returns Array de UUIDs encontrados
 */
export function extractUUIDsFromText(text: string): string[] {
  const matches = text.match(UUID_V4_REGEX);
  return matches || [];
}

/**
 * Sanitiza valor de ID removendo espaços e convertendo para lowercase
 * @param value - Valor para sanitizar
 * @returns Valor sanitizado ou null
 */
export function sanitizeUUID(value: string | null | undefined): string | null {
  if (!value) return null;
  
  const cleaned = value.trim().toLowerCase();
  return isValidUUID(cleaned) ? cleaned : null;
}

/**
 * Tipo TypeScript guard para UUID
 */
export type UUID = string & { readonly __brand: unique symbol };

/**
 * Cria um tipo UUID validado
 * @param value - String para converter
 * @returns UUID tipado ou null
 */
export function asUUID(value: string | null | undefined): UUID | null {
  return isValidUUID(value) ? (value as UUID) : null;
}

