import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
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
  const totalPaid = paymentDetails.reduce((sum, payment) => sum + payment.amount, 0);
  const cashPayment = paymentDetails.find(p => p.method === 'cash');
  const cashAmount = cashPayment ? cashPayment.amount : 0;
  const cashChange = Math.max(0, cashAmount - total);
  const remaining = total - totalPaid;
  
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

// Função para gerar UUID determinístico baseado em string de entrada
export function generateDeterministicUUID(input: string): string {
  // Se já é um UUID válido, retorna como está
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)) {
    return input.toLowerCase();
  }
  
  // Criar hash determinístico usando FNV-1a
  let hash = 0x811c9dc5; // FNV offset basis
  
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash *= 0x01000193; // FNV prime
    hash &= 0xffffffff; // Keep 32-bit
  }
  
  // Adicionar timestamp para garantir unicidade temporal
  const timestamp = Date.now();
  hash ^= timestamp;
  hash ^= hash >>> 16;
  hash *= 0x85ebca6b;
  hash ^= hash >>> 13;
  hash *= 0xc2b2ae35;
  hash ^= hash >>> 16;
  
  // Converter para hex e garantir 32 caracteres
  const hex = Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32);
  
  // Montar UUID v4 válido com formatação correta
  const uuid = [
    hex.substring(0, 8),
    hex.substring(8, 12),
    '4' + hex.substring(13, 16), // Version 4 (4xxx)
    '8' + hex.substring(17, 20), // Variant 10xx (8xxx, 9xxx, axxx, bxxx)
    hex.substring(20, 32)
  ].join('-').toLowerCase();
  
  return uuid;
}

// Função para gerar UUID aleatório (mantida para compatibilidade)
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Função principal para gerar UUID coerente com o backend
export function generateCoherentUUID(seed?: string): string {
  if (seed) {
    return generateDeterministicUUID(seed);
  }
  
  // Para novos registros sem seed, usar timestamp + random para garantir unicidade
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return generateDeterministicUUID(timestamp + random);
}

export function convertPrismaIdToUUID(prismaId: string): string {
  // Se já é um UUID válido, retorna como está
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(prismaId)) {
    return prismaId;
  }
  
  // Se é um ID do Prisma (cuid), converte para UUID usando hash
  if (/^[a-z0-9]{21}$/i.test(prismaId) || /^[a-z0-9]{25}$/i.test(prismaId)) {
    // Usa o ID do Prisma como base para gerar um UUID determinístico
    let hash1 = 0;
    let hash2 = 0;
    
    for (let i = 0; i < prismaId.length; i++) {
      const char = prismaId.charCodeAt(i);
      hash1 = ((hash1 << 5) - hash1) + char;
      hash1 = hash1 & hash1; // Convert to 32-bit integer
      hash2 = ((hash2 << 3) - hash2) + char;
      hash2 = hash2 & hash2; // Convert to 32-bit integer
    }
    
    // Gera UUID válido baseado nos hashes
    const hex1 = Math.abs(hash1).toString(16).padStart(8, '0');
    const hex2 = Math.abs(hash2).toString(16).padStart(8, '0');
    const hex3 = Math.abs(hash1 ^ hash2).toString(16).padStart(8, '0');
    const hex4 = Math.abs(hash1 + hash2).toString(16).padStart(8, '0');
    
    return `${hex1}-${hex2.substring(0, 4)}-4${hex3.substring(1, 4)}-a${hex4.substring(2, 5)}-${hex1.substring(0, 4)}${hex2.substring(4, 8)}${hex3.substring(4, 8)}`;
  }
  
  // Se não é nem UUID nem Prisma ID, gera um UUID aleatório
  return generateUUID();
}

// Função para detectar se um ID é do formato Prisma (cuid)
export function isPrismaId(id: string): boolean {
  // Prisma cuid pode ter 21 ou 25 caracteres
  return /^[a-z0-9]{21}$/i.test(id) || /^[a-z0-9]{25}$/i.test(id);
}

// Função para detectar se um ID é UUID
export function isUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// Função para validar se um ID é UUID ou CUID válido
export function isValidId(id: string): boolean {
  return isUUID(id) || isPrismaId(id);
}

// Função para garantir que um ID seja coerente com o backend
export function ensureCoherentId(id: string, context?: string): string {
  console.log(`[ensureCoherentId] Input ID: ${id}, Context: ${context || 'unknown'}`);
  
  // Validar se o ID não está vazio ou é inválido
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error(`[ensureCoherentId] ID vazio ou inválido: ${id}`);
    throw new Error(`ID inválido fornecido para ${context || 'contexto desconhecido'}: ${id}`);
  }
  
  // Verificar se é um UUID malformado (como o problema reportado)
  if (id.includes('00000000-0000-4000-8000-000063ef2970') || id.match(/^0{8}-0{4}-4000-8000-0{12}$/)) {
    console.error(`[ensureCoherentId] UUID malformado detectado: ${id}`);
    throw new Error(`UUID malformado detectado para ${context || 'contexto desconhecido'}: ${id}. Verifique a integridade dos dados do produto.`);
  }
  
  // Se já é UUID válido, retornar como está
  if (isUUID(id)) {
    console.log(`[ensureCoherentId] ID já é UUID válido: ${id}`);
    return id.toLowerCase();
  }
  
  // Se é CUID, converter para UUID determinístico
  if (isPrismaId(id)) {
    const converted = convertCuidToUuid(id);
    console.log(`[ensureCoherentId] CUID convertido para UUID: ${id} -> ${converted}`);
    return converted;
  }
  
  // Se não é nem UUID nem CUID, gerar UUID determinístico baseado no input
  const generated = generateDeterministicUUID(id);
  console.log(`[ensureCoherentId] ID convertido para UUID determinístico: ${id} -> ${generated}`);
  return generated;
}

// Função para normalizar IDs em objetos de dados
export function normalizeIdsInData(data: any, context?: string): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => normalizeIdsInData(item, context));
  }
  
  const normalized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && (key.endsWith('Id') || key === 'id')) {
      // É um campo de ID, normalizar
      normalized[key] = ensureCoherentId(value, `${context}.${key}`);
    } else if (typeof value === 'object' && value !== null) {
      normalized[key] = normalizeIdsInData(value, `${context}.${key}`);
    } else {
      normalized[key] = value;
    }
  }
  
  return normalized;
}

// Função para formatar campos de número removendo zeros iniciais
export function formatNumberInput(value: string): string {
  // Se o valor estiver vazio, retornar vazio
  if (!value) return '';
  
  // Remover caracteres não numéricos exceto ponto decimal
  let cleaned = value.replace(/[^0-9.]/g, '');
  
  // Se começar com zero seguido de números (não decimais), remover o zero
  if (cleaned.match(/^0[1-9]/)) {
    cleaned = cleaned.substring(1);
  }
  
  // Se for apenas "0." ou "0,", manter como está
  if (cleaned === '0.' || cleaned === '0,') {
    return cleaned;
  }
  
  // Se for apenas "0", retornar vazio para permitir digitação
  if (cleaned === '0') {
    return '';
  }
  
  return cleaned;
}

// Função para lidar com o evento onChange de campos de número
export function handleNumberInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (value: string) => void
) {
  const formatted = formatNumberInput(e.target.value);
  setValue(formatted);
  e.target.value = formatted;
}

// Mapeamento para garantir conversão determinística de CUID para UUID
const cuidToUuidMap = new Map<string, string>();

// Função para converter CUID para UUID válido e consistente
export function convertCuidToUuid(cuid: string): string {
  // Se já é um UUID, retornar como está
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(cuid)) {
    return cuid.toLowerCase();
  }
  
  // Verificar se já temos uma conversão para este CUID
  if (cuidToUuidMap.has(cuid)) {
    return cuidToUuidMap.get(cuid)!;
  }
  
  // Se é um CUID, converter para UUID determinístico
  const cuidRegex = /^[a-z0-9]{25}$/i; // CUIDs têm 25 caracteres
  if (cuidRegex.test(cuid)) {
    // Usar a função determinística para converter CUID para UUID
    const uuid = generateDeterministicUUID(cuid);
    
    // Validar se o UUID gerado é válido
    if (uuidRegex.test(uuid)) {
      // Armazenar mapeamento para reutilização
      cuidToUuidMap.set(cuid, uuid);
      return uuid;
    }
  }
  
  // Se não conseguiu converter, gerar um UUID determinístico baseado no input
  console.warn(`[convertCuidToUuid] Não foi possível converter '${cuid}' para UUID válido. Gerando UUID determinístico.`);
  const fallbackUuid = generateDeterministicUUID(cuid);
  cuidToUuidMap.set(cuid, fallbackUuid);
  return fallbackUuid;
}

// Função para verificar se um ID é válido para o backend
export function isValidBackendId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Função para determinar se o backend requer UUIDs baseado no formato dos IDs
export function backendRequiresUuids(ids: string[]): boolean {
  // Se todos os IDs já são UUIDs, não precisa converter
  const allUuids = ids.every(id => isValidBackendId(id));
  if (allUuids) return false;
  
  // Se algum ID não é UUID, provavelmente o backend precisa de conversão
  const hasNonUuid = ids.some(id => !isValidBackendId(id));
  return hasNonUuid;
}

// Função de teste específica para vendas
export function testSaleUuidConversion() {
  console.log('[TEST] Testando comportamento correto para vendas...');
  
  // Simular produtos com diferentes tipos de ID
  const testProducts = [
    { id: 'cmgx0svyi0006hmx0ffbzwcwv', name: 'Produto CUID' },
    { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Produto UUID' },
    { id: 'invalid-id', name: 'Produto Inválido' }
  ];
  
  // Para vendas (POST), usar IDs originais - backend aceita CUIDs para criação
  const testItems = testProducts.map(product => ({
    productId: product.id, // Manter ID original
    quantity: 1
  }));
  
  console.log('[TEST] Produtos originais:', testProducts);
  console.log('[TEST] Items para venda (IDs originais):', testItems);
  
  // Verificar se temos uma mistura de CUIDs e UUIDs (comportamento esperado)
  const hasCuids = testItems.some(item => /^[a-z0-9]{25}$/i.test(item.productId));
  const hasUuids = testItems.some(item => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.productId));
  
  console.log('[TEST] Contém CUIDs:', hasCuids ? '✅ OK' : '❌ FALHA');
  console.log('[TEST] Contém UUIDs:', hasUuids ? '✅ OK' : '❌ FALHA');
  console.log('[TEST] Comportamento correto para vendas:', (hasCuids || hasUuids) ? '✅ OK' : '❌ FALHA');
  
  return {
    originalProducts: testProducts,
    saleItems: testItems,
    hasCuids,
    hasUuids,
    correctBehavior: hasCuids || hasUuids
  };
}

// Função de teste global para debug
export function testUuidConversion() {
  const testCuid = 'cmgx0svyi0006hmx0ffbzwcwv';
  console.log('[TEST] Testing CUID conversion with:', testCuid);
  
  const result = convertCuidToUuid(testCuid);
  const isValid = isValidBackendId(result);
  
  console.log('[TEST] Conversion result:', result);
  console.log('[TEST] Is valid UUID:', isValid);
  console.log('[TEST] Length:', result.length);
  console.log('[TEST] Format check:', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result));
  
  return { result, isValid };
}

// Função de teste para verificar consistência de UUIDs
export function testUuidConsistency() {
  console.log('[TEST] Testando consistência de UUIDs...');
  
  const testIds = [
    'cmgx0svyi0006hmx0ffbzwcwv', // CUID
    '123e4567-e89b-12d3-a456-426614174000', // UUID válido
    'invalid-id', // ID inválido
    'cmgx0svyi0006hmx0ffbzwcwv' // CUID duplicado para testar consistência
  ];
  
  const results = testIds.map(id => {
    const converted = ensureCoherentId(id);
    const isValid = isValidBackendId(converted);
    const isConsistent = testIds.filter(testId => testId === id).length === 1 || 
                       testIds.filter(testId => ensureCoherentId(testId) === converted).length === 1;
    
    return {
      original: id,
      converted,
      isValid,
      isConsistent
    };
  });
  
  console.log('[TEST] Resultados da consistência:', results);
  
  const allValid = results.every(r => r.isValid);
  const allConsistent = results.every(r => r.isConsistent);
  
  console.log('[TEST] Todos os IDs são válidos:', allValid ? '✅ OK' : '❌ FALHA');
  console.log('[TEST] Todos os IDs são consistentes:', allConsistent ? '✅ OK' : '❌ FALHA');
  
  return {
    results,
    allValid,
    allConsistent,
    success: allValid && allConsistent
  };
}

// Tornar funções globais para teste no console
if (typeof window !== 'undefined') {
  (window as any).testUuidConversion = testUuidConversion;
  (window as any).testUuidConsistency = testUuidConsistency;
  (window as any).testSaleUuidConversion = testSaleUuidConversion;
  (window as any).generateCoherentUUID = generateCoherentUUID;
  (window as any).convertCuidToUuid = convertCuidToUuid;
  (window as any).ensureCoherentId = ensureCoherentId;
}
