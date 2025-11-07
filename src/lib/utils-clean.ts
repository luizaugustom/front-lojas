import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(0);
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return '';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateTime:', date);
    return '';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatCPFCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    // CPF
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    // CNPJ
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}

export function formatBarcode(value: string): string {
  return value.replace(/\D/g, '');
}

export function calculateChange(totalPaid: number, total: number): number {
  return Math.max(0, totalPaid - total);
}

export function calculateMultiplePaymentChange(
  paymentDetails: Array<{ method: string; amount: number }>,
  total: number
): { cashChange: number; totalPaid: number; remaining: number } {
  const roundToCents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

  const totalPaid = roundToCents(
    paymentDetails.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  );
  const cashPayment = paymentDetails.find(p => p.method === 'cash');
  const cashAmount = Number(cashPayment?.amount ?? 0);
  const cashChange = roundToCents(Math.max(0, cashAmount - total));
  const remaining = roundToCents(total - totalPaid);
  
  return {
    cashChange,
    totalPaid,
    remaining
  };
}

export function isValidCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;
  
  return true;
}

export function isValidCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  let sum = 0;
  let pos = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(numbers.charAt(12))) return false;
  
  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(numbers.charAt(13))) return false;
  
  return true;
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function getFileExtension(format: string): string {
  const extensions: Record<string, string> = {
    json: 'json',
    xml: 'xml',
    excel: 'xlsx',
  };
  return extensions[format] || format;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// ============================================================================
// FUNÇÕES APENAS PARA UUID v4 - SEM CONVERSÕES DE CUID
// ============================================================================

/**
 * Valida se uma string é um UUID v4 válido
 * @param id - String para validar
 * @returns true se for um UUID v4 válido
 */
export function isUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Gera um UUID v4 aleatório válido
 * @returns UUID v4 gerado
 */
export function generateUUID(): string {
  // Usar crypto.randomUUID() se disponível (navegadores modernos)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para navegadores mais antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Valida se um ID é válido (apenas UUID v4)
 * @param id - String para validar
 * @returns true se for um UUID v4 válido
 */
export function isValidId(id: string): boolean {
  return isUUID(id);
}

/**
 * Garante que um ID seja um UUID v4 válido
 * @param id - ID para validar
 * @param context - Contexto para mensagens de erro
 * @returns UUID v4 válido
 * @throws Error se o ID não for válido
 */
export function ensureValidUUID(id: string, context?: string): string {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`ID vazio ou inválido fornecido para ${context || 'contexto desconhecido'}: ${id}`);
  }
  
  if (!isUUID(id)) {
    throw new Error(`ID inválido fornecido para ${context || 'contexto desconhecido'}: ${id}. Esperado formato UUID v4 válido (ex: 550e8400-e29b-41d4-a716-446655440000)`);
  }
  
  return id.toLowerCase();
}

/**
 * Sanitiza um UUID removendo espaços e convertendo para lowercase
 * @param uuid - UUID para sanitizar
 * @returns UUID sanitizado ou null se inválido
 */
export function sanitizeUUID(uuid: string): string | null {
  if (!uuid) return null;
  
  const cleaned = uuid.trim().toLowerCase();
  return isUUID(cleaned) ? cleaned : null;
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
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const matches = text.match(uuidRegex);
  return matches || [];
}

/**
 * Valida se um objeto tem propriedade ID válida
 * @param obj - Objeto para validar
 * @returns true se o objeto tem ID UUID válido
 */
export function hasValidId(obj: any): obj is { id: string } {
  return obj && typeof obj === 'object' && 'id' in obj && isUUID(obj.id);
}

/**
 * Filtra array removendo itens com IDs inválidos
 * @param items - Array de objetos com propriedade id
 * @returns Array filtrado apenas com UUIDs válidos
 */
export function filterValidIds<T extends { id: string }>(items: T[]): T[] {
  return items.filter(item => isUUID(item.id));
}

/**
 * Formata UUID para exibição amigável
 * @param uuid - UUID completo
 * @param length - Número de caracteres para mostrar (padrão: 8)
 * @returns UUID truncado com "..."
 */
export function formatUUIDForDisplay(uuid: string | null | undefined, length: number = 8): string {
  if (!uuid) return 'N/A';
  
  if (!isUUID(uuid)) {
    return 'UUID Inválido';
  }
  
  if (uuid.length <= length) {
    return uuid;
  }
  
  return `${uuid.substring(0, length)}...`;
}

/**
 * Valida e normaliza IDs em um objeto de dados
 * @param data - Dados para validar
 * @param context - Contexto para mensagens de erro
 * @returns Dados com IDs validados
 */
export function validateUUIDsInData(data: any, context?: string): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => validateUUIDsInData(item, context));
  }
  
  const validated: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && (key.endsWith('Id') || key === 'id')) {
      // É um campo de ID, validar
      validated[key] = ensureValidUUID(value, `${context}.${key}`);
    } else if (typeof value === 'object' && value !== null) {
      validated[key] = validateUUIDsInData(value, `${context}.${key}`);
    } else {
      validated[key] = value;
    }
  }
  
  return validated;
}

/**
 * Formata campos de número removendo zeros iniciais
 * @param value - Valor para formatar
 * @returns Valor formatado
 */
export function formatNumberInput(value: string): string {
  if (!value) return '';
  
  // Aceitar vírgulas e pontos como separador decimal
  // Primeiro, substituir vírgulas por pontos para processamento
  let cleaned = value.replace(/,/g, '.');
  
  // Remover todos os caracteres que não são números ou ponto
  cleaned = cleaned.replace(/[^0-9.]/g, '');
  
  // Remover múltiplos pontos decimais, mantendo apenas o primeiro
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Remover zeros à esquerda antes de números (exceto se for "0." ou "0,")
  if (cleaned.match(/^0+[1-9]/)) {
    cleaned = cleaned.replace(/^0+/, '');
  }
  
  // Permitir "0." para que o usuário possa digitar decimais começando com zero
  if (cleaned === '0.') {
    return cleaned;
  }
  
  // Se for apenas "0", permitir para que possa continuar digitando
  if (cleaned === '0') {
    return cleaned;
  }
  
  return cleaned;
}

/**
 * Lida com o evento onChange de campos de número
 * @param e - Evento de mudança
 * @param setValue - Função para definir valor
 */
export function handleNumberInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (value: string) => void
) {
  const formatted = formatNumberInput(e.target.value);
  setValue(formatted);
  e.target.value = formatted;
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
  return value && isUUID(value) ? (value as UUID) : null;
}

/**
 * Alias para ensureValidUUID - Valida UUID e lança erro se inválido
 * @param value - UUID para validar
 * @param fieldName - Nome do campo para mensagem de erro
 * @returns UUID válido
 * @throws Error se UUID for inválido
 */
export function validateUUID(value: string, fieldName: string): string {
  return ensureValidUUID(value, fieldName);
}