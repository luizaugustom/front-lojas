/**
 * Utilitário para carregar e buscar dados de NCM da API da Receita Federal
 */

export interface NCMItem {
  codigo: string; // 8 dígitos
  descricao: string;
  ex?: string; // Exceção da TIPI
  tipo?: string;
  vigenciaInicio?: string;
  vigenciaFim?: string;
}

interface NCMCache {
  data: NCMItem[];
  timestamp: number;
  version: string;
}

const CACHE_KEY = 'ncm_data_cache';
const CACHE_EXPIRY_DAYS = 7;
const API_URL = 'https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json';

/**
 * Verifica se o cache está válido
 */
function isCacheValid(cache: NCMCache | null): boolean {
  if (!cache) return false;
  
  const now = Date.now();
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 dias em ms
  const isValid = (now - cache.timestamp) < expiryTime;
  
  return isValid;
}

/**
 * Carrega dados do cache
 */
function loadFromCache(): NCMCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const cache: NCMCache = JSON.parse(cached);
    return isCacheValid(cache) ? cache : null;
  } catch (error) {
    console.error('Erro ao carregar cache de NCM:', error);
    return null;
  }
}

/**
 * Salva dados no cache
 */
function saveToCache(data: NCMItem[]): void {
  try {
    const cache: NCMCache = {
      data,
      timestamp: Date.now(),
      version: '1.0',
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Erro ao salvar cache de NCM:', error);
    // Se o localStorage estiver cheio, tenta limpar cache antigo
    try {
      localStorage.removeItem(CACHE_KEY);
      const cache: NCMCache = {
        data,
        timestamp: Date.now(),
        version: '1.0',
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error('Erro ao limpar e recriar cache:', e);
    }
  }
}

/**
 * Normaliza dados da API para o formato esperado
 */
function normalizeAPIData(apiData: any[]): NCMItem[] {
  if (!Array.isArray(apiData)) {
    return [];
  }

  const normalizedItems: NCMItem[] = [];

  for (const item of apiData) {
    // A API pode retornar diferentes formatos, tentamos normalizar
    const codigo = item.codigo || item.Codigo || item.code || '';
    const descricao = item.descricao || item.Descricao || item.description || '';
    
    // Garantir que o código tenha 8 dígitos
    const normalizedCode = codigo.toString().padStart(8, '0').slice(0, 8);
    
    if (!normalizedCode || normalizedCode.length !== 8) {
      continue;
    }

    normalizedItems.push({
      codigo: normalizedCode,
      descricao: descricao.trim(),
      ex: item.ex || item.Ex || item.exception || undefined,
      tipo: item.tipo || item.Tipo || item.type || undefined,
      vigenciaInicio: item.vigenciaInicio || item.VigenciaInicio || undefined,
      vigenciaFim: item.vigenciaFim || item.VigenciaFim || undefined,
    });
  }

  return normalizedItems;
}

/**
 * Carrega dados de NCM da API ou cache
 */
export async function loadNCMData(forceRefresh = false): Promise<NCMItem[]> {
  // Tentar carregar do cache primeiro (se não for refresh forçado)
  if (!forceRefresh) {
    const cached = loadFromCache();
    if (cached && cached.data.length > 0) {
      return cached.data;
    }
  }

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Verificar se a resposta é um erro da API
    if (data.code || data.message) {
      throw new Error(data.message || 'Erro desconhecido da API');
    }

    // Normalizar dados
    const normalizedData = normalizeAPIData(Array.isArray(data) ? data : [data]);
    
    if (normalizedData.length === 0) {
      // Se não conseguiu normalizar, tentar cache novamente
      const cached = loadFromCache();
      if (cached && cached.data.length > 0) {
        return cached.data;
      }
      throw new Error('Nenhum dado NCM encontrado na resposta da API');
    }

    // Salvar no cache
    saveToCache(normalizedData);
    
    return normalizedData;
  } catch (error) {
    console.error('Erro ao carregar dados NCM da API:', error);
    
    // Tentar usar cache mesmo que expirado em caso de erro
    const cached = loadFromCache();
    if (cached && cached.data.length > 0) {
      console.warn('Usando cache expirado devido a erro na API');
      return cached.data;
    }

    throw error;
  }
}

/**
 * Busca NCMs por código ou descrição
 */
export function searchNCM(query: string, data: NCMItem[]): NCMItem[] {
  if (!query || query.trim().length === 0) {
    return data.slice(0, 100); // Limitar resultados iniciais
  }

  const searchTerm = query.trim().toLowerCase();
  const isNumericSearch = /^\d+$/.test(searchTerm);

  const results = data.filter((item) => {
    // Busca por código (exata ou parcial)
    if (isNumericSearch) {
      const codeMatch = item.codigo.includes(searchTerm);
      if (codeMatch) return true;
    }

    // Busca por descrição (case-insensitive)
    const descMatch = item.descricao.toLowerCase().includes(searchTerm);
    return descMatch;
  });

  // Ordenar resultados: códigos exatos primeiro, depois parciais, depois descrições
  return results.sort((a, b) => {
    const aCode = a.codigo.toLowerCase();
    const bCode = b.codigo.toLowerCase();
    
    // Código exato primeiro
    if (aCode === searchTerm && bCode !== searchTerm) return -1;
    if (bCode === searchTerm && aCode !== searchTerm) return 1;
    
    // Códigos que começam com o termo
    if (aCode.startsWith(searchTerm) && !bCode.startsWith(searchTerm)) return -1;
    if (bCode.startsWith(searchTerm) && !aCode.startsWith(searchTerm)) return 1;
    
    // Ordenar por código
    return aCode.localeCompare(bCode);
  });
}

/**
 * Retorna um NCM específico por código
 */
export function getNCMByCode(code: string, data: NCMItem[]): NCMItem | undefined {
  const normalizedCode = code.toString().padStart(8, '0').slice(0, 8);
  return data.find((item) => item.codigo === normalizedCode);
}

/**
 * Limpa o cache de NCM
 */
export function clearNCMCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Erro ao limpar cache de NCM:', error);
  }
}

/**
 * Obtém informações do cache (útil para debug)
 */
export function getCacheInfo(): { exists: boolean; isValid: boolean; itemCount: number; age: number } {
  const cache = loadFromCache();
  if (!cache) {
    return { exists: false, isValid: false, itemCount: 0, age: 0 };
  }

  const now = Date.now();
  const age = now - cache.timestamp;
  const isValid = isCacheValid(cache);

  return {
    exists: true,
    isValid,
    itemCount: cache.data.length,
    age: Math.floor(age / (1000 * 60 * 60)), // Idade em horas
  };
}
