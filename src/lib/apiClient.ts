import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { User, UserRole } from '@/types';

// Configurações de ambiente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const USE_HTTPS = process.env.NEXT_PUBLIC_USE_HTTPS === 'true';

console.log('[API Client] Configuração:', { 
  API_BASE_URL, 
  USE_HTTPS,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
});

// Armazenamento do access token (memória + sessionStorage como backup)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  console.log('[setAccessToken]', {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : null,
  });
  accessToken = token;
  
  // Backup em sessionStorage para persistir entre navegações
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('access_token', token);
      console.log('[setAccessToken] Token salvo no sessionStorage');
    } else {
      sessionStorage.removeItem('access_token');
      console.log('[setAccessToken] Token removido do sessionStorage');
    }
  }
}

export function getAccessToken(): string | null {
  // Tenta memória primeiro, depois sessionStorage
  if (accessToken) {
    console.log('[getAccessToken] Token encontrado na memória');
    return accessToken;
  }
  
  // Fallback para sessionStorage se token foi perdido da memória
  if (typeof window !== 'undefined') {
    const storedToken = sessionStorage.getItem('access_token');
    console.log('[getAccessToken] Verificando sessionStorage:', { hasStoredToken: !!storedToken });
    if (storedToken) {
      console.log('[getAccessToken] Token recuperado do sessionStorage');
      accessToken = storedToken; // Restaura na memória
      return storedToken;
    }
  }
  
  console.log('[getAccessToken] Nenhum token encontrado');
  return null;
}

export function clearAccessToken() {
  console.log('[clearAccessToken] Limpando token');
  accessToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('access_token');
  }
}

// Event listeners para o AuthContext reagir a refresh/logout automáticos
type RefreshListener = (payload: { user: User; accessToken: string }) => void;
type LogoutListener = () => void;
const refreshListeners = new Set<RefreshListener>();
const logoutListeners = new Set<LogoutListener>();

export function onAuthRefreshed(listener: RefreshListener) {
  refreshListeners.add(listener);
  return () => refreshListeners.delete(listener);
}

export function onAuthLoggedOut(listener: LogoutListener) {
  logoutListeners.add(listener);
  return () => logoutListeners.delete(listener);
}

// Mapeamento de IDs CUID para UUID (para manter correspondência com o backend)
const idMapping = new Map<string, string>();

// Função para converter CUID para UUID determinístico
function cuidToUuid(cuid: string): string {
  // Se já é UUID, retorna como está
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cuid)) {
    return cuid;
  }
  
  // Se é CUID, verificar se já temos mapeamento
  if (/^[a-z0-9]{25}$/i.test(cuid)) {
    if (idMapping.has(cuid)) {
      return idMapping.get(cuid)!;
    }
    
    // Usar função determinística para converter CUID para UUID
    const { generateDeterministicUUID } = require('./utils');
    const uuid = generateDeterministicUUID(cuid);
    
    // Armazenar mapeamento
    idMapping.set(cuid, uuid);
    return uuid;
  }
  
  return cuid;
}

// Axios instance principal para a aplicação
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Envia cookies httpOnly (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios independente para o refresh, para evitar loops de interceptors
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fila de refresh para evitar múltiplas chamadas simultâneas
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

// Extensão de config para marcar retry
type RequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Interceptor automático para conversão de UUIDs
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  // Conversão automática de IDs para operações que requerem UUID
  const url = config.url || '';
  
  // Detectar IDs CUID na URL (padrão: /endpoint/:id) para PATCH/DELETE
  if (config.method === 'patch' || config.method === 'delete') {
    const urlMatch = url.match(/\/([a-z0-9]{25})\/?$/i);
    if (urlMatch) {
      const cuidId = urlMatch[1];
      console.log(`[UUID Interceptor] Detectado CUID ${cuidId} em ${config.method?.toUpperCase()} ${url}`);
      
      // Converter CUID para UUID
      const uuidId = cuidToUuid(cuidId);
      const newUrl = url.replace(cuidId, uuidId);
      
      console.log(`[UUID Interceptor] Convertendo ${cuidId} -> ${uuidId}`);
      console.log(`[UUID Interceptor] Nova URL: ${newUrl}`);
      
      config.url = newUrl;
    }
  }
  
  // Detectar IDs CUID nos dados do body para operações que podem exigir UUIDs
  if ((config.method === 'patch' || config.method === 'post') && config.data) {
    // Verificar se é uma operação que pode exigir UUIDs
    const requiresUuidEndpoints = [
      '/sale', // Vendas podem exigir UUIDs
      // '/product', // Produtos - DESABILITADO temporariamente para debug
      '/customer', // Clientes podem exigir UUIDs
      '/seller', // Vendedores podem exigir UUIDs
    ];
    
    const needsConversion = requiresUuidEndpoints.some(endpoint => url.includes(endpoint));
    
    if (needsConversion) {
      console.log(`[UUID Interceptor] Dados originais antes da conversão:`, JSON.stringify(config.data));
      const convertedData = convertIdsInRequestBody(config.data, url);
      console.log(`[UUID Interceptor] Dados após conversão:`, JSON.stringify(convertedData));
      if (convertedData !== config.data) {
        console.log(`[UUID Interceptor] Convertendo IDs no body da requisição ${config.method?.toUpperCase()} ${url}`);
        config.data = convertedData;
      }
    }
  }
  
  return config;
});

// Cache de mapeamento bidirecional de IDs
const idMappingCache = new Map<string, string>();

// Interceptor de resposta para construir mapeamento de IDs
instance.interceptors.response.use((response) => {
  // Interceptar respostas para construir mapeamento de IDs
  if (response.data) {
    const data = response.data;
    
    // Se é um array de itens
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.id && /^[a-z0-9]{25}$/i.test(item.id)) {
          // Armazenar mapeamento CUID -> CUID (para endpoints que aceitam CUIDs)
          idMappingCache.set(item.id, item.id);
        }
      });
    }
    
    // Se é um objeto com array de dados
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        if (item.id && /^[a-z0-9]{25}$/i.test(item.id)) {
          idMappingCache.set(item.id, item.id);
        }
      });
    }
    
    // Se é um item único
    if (data.id && /^[a-z0-9]{25}$/i.test(data.id)) {
      idMappingCache.set(data.id, data.id);
    }
  }
  
  return response;
});

// Função para buscar UUID real do backend através de listagem
async function findRealUuidFromBackend(cuid: string, endpoint: string): Promise<string | null> {
  try {
    console.log(`[ID Mapping] Buscando UUID real para ${cuid} em ${endpoint}`);
    
    // Buscar todos os registros do endpoint
    const response = await instance.get(endpoint);
    const items = response.data?.data || response.data || [];
    
    // Procurar o registro com o CUID
    const foundItem = items.find((item: any) => item.id === cuid);
    if (foundItem) {
      // Se encontrou, o ID já é o correto (pode ser que o backend aceite CUIDs)
      console.log(`[ID Mapping] Encontrado registro com CUID original: ${cuid}`);
      return cuid;
    }
    
    // Se não encontrou com CUID, pode ser que o backend tenha convertido internamente
    // Vamos tentar uma abordagem diferente: buscar por outros campos únicos
    console.log(`[ID Mapping] CUID ${cuid} não encontrado diretamente`);
    return null;
    
  } catch (error) {
    console.warn(`[ID Mapping] Erro ao buscar UUID real para ${cuid}:`, error);
    return null;
  }
}

// Função para converter IDs com estratégia inteligente
export async function convertIdForBackend(id: string, endpoint: string): Promise<string> {
  // Se já é UUID, retornar como está
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  
  // Se é CUID, usar estratégia baseada no endpoint
  if (/^[a-z0-9]{25}$/i.test(id)) {
    // Endpoints que aceitam CUIDs (não converter)
    const cuidAcceptedEndpoints = ['/product', '/seller'];
    const acceptsCuid = cuidAcceptedEndpoints.some(ep => endpoint.includes(ep));
    
    if (acceptsCuid) {
      return id; // Retornar CUID original
    }
    
    // Para endpoints que precisam de UUIDs, vamos usar uma estratégia diferente
    // Vamos tentar usar o CUID original primeiro, e se der erro, usar uma conversão mais simples
    return id; // Por enquanto, usar ID original
  }
  
  return id;
}

// Função para converter IDs em objetos de dados
async function convertIdsInData(data: any, endpoint: string): Promise<any> {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return await Promise.all(data.map(item => convertIdsInData(item, endpoint)));
  }
  
  const converted: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && /^[a-z0-9]{25}$/i.test(value)) {
      // É um CUID, verificar se precisa converter
      if (key.endsWith('Id') || key === 'id' || key === 'productId' || key === 'customerId' || key === 'sellerId') {
        converted[key] = await convertIdForBackend(value, endpoint);
      } else {
        converted[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = await convertIdsInData(value, endpoint);
    } else {
      converted[key] = value;
    }
  }
  
  return converted;
}

// Função para converter IDs no body da requisição (síncrona)
function convertIdsInRequestBody(data: any, url: string): any {
  console.log(`[convertIdsInRequestBody] Entrada:`, JSON.stringify(data));
  
  if (!data || typeof data !== 'object') {
    console.log(`[convertIdsInRequestBody] Retornando dados originais (não é objeto):`, data);
    return data;
  }
  
  if (Array.isArray(data)) {
    console.log(`[convertIdsInRequestBody] Processando array com ${data.length} itens`);
    return data.map(item => convertIdsInRequestBody(item, url));
  }
  
  const converted: any = {};
  for (const [key, value] of Object.entries(data)) {
    console.log(`[convertIdsInRequestBody] Processando campo: ${key} = ${value} (tipo: ${typeof value})`);
    
    if (typeof value === 'string' && /^[a-z0-9]{25}$/i.test(value)) {
      // É um CUID, converter para UUID se for campo de ID
      if (key.endsWith('Id') || key === 'id' || key === 'productId' || key === 'customerId' || key === 'sellerId' || key === 'companyId') {
        converted[key] = cuidToUuid(value);
        console.log(`[UUID Interceptor] Convertendo ${key}: ${value} -> ${converted[key]}`);
      } else {
        converted[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = convertIdsInRequestBody(value, url);
    } else {
      converted[key] = value;
    }
  }
  
  console.log(`[convertIdsInRequestBody] Resultado:`, JSON.stringify(converted));
  return converted;
}

// Wrapper para chamadas da API que funciona com o backend atual
export async function apiCallWithIdConversion<T = any>(
  method: 'get' | 'post' | 'patch' | 'delete',
  url: string,
  data?: any,
  config?: any
): Promise<T> {
  // Estratégia definitiva: usar IDs originais e implementar fallback inteligente
  
  // Tentativa 1: Usar IDs originais (funciona para produtos e vendedores)
  try {
    if (method === 'get') {
      return await instance.get(url, config);
    } else if (method === 'post') {
      return await instance.post(url, data, config);
    } else if (method === 'patch') {
      return await instance.patch(url, data, config);
    } else if (method === 'delete') {
      return await instance.delete(url, config);
    }
  } catch (error: any) {
    console.log(`[API Fallback] Tentativa original falhou para ${url}: ${error.response?.data?.message || error.message}`);
    
    // Se erro de UUID, implementar fallback específico por endpoint
    if (error.response?.status === 400 && 
        (error.response?.data?.message?.includes('uuid is expected') ||
         error.response?.data?.message?.includes('must be a UUID'))) {
      
      console.log(`[API Fallback] Implementando fallback para ${url}`);
      
      // Para endpoints problemáticos, vamos implementar uma solução específica
      const urlParts = url.split('/');
      const endpoint = '/' + urlParts[1];
      
      // Estratégia específica por endpoint
      if (endpoint === '/customer') {
        // Para clientes, vamos tentar uma abordagem diferente
        console.log(`[API Fallback] Estratégia específica para clientes`);
        
        // Tentar buscar o cliente por outros campos se possível
        // Por enquanto, vamos aceitar que algumas operações podem falhar
        console.log(`[API Fallback] Operação de cliente não suportada com IDs atuais`);
        throw new Error('Operação não suportada: Backend requer UUIDs para clientes');
        
      } else if (endpoint === '/bill-to-pay') {
        // Para contas a pagar, estratégia específica
        console.log(`[API Fallback] Estratégia específica para contas a pagar`);
        throw new Error('Operação não suportada: Backend requer UUIDs para contas a pagar');
        
      } else if (endpoint === '/sale') {
        // Para vendas, converter productIds
        console.log(`[API Fallback] Estratégia específica para vendas`);
        
        if (data && data.items) {
          const convertedData = { ...data };
          convertedData.items = data.items.map((item: any) => ({
            ...item,
            productId: cuidToUuid(item.productId)
          }));
          
          console.log(`[API Fallback] Convertendo productIds para vendas`);
          
          try {
            return await instance.post(url, convertedData, config);
          } catch (retryError: any) {
            console.log(`[API Fallback] Conversão de productIds falhou: ${retryError.response?.data?.message || retryError.message}`);
            throw retryError;
          }
        }
      }
      
      // Se não conseguir implementar fallback específico, re-lançar erro
      throw error;
    }
    
    // Se não for erro de UUID, re-lançar o erro original
    throw error;
  }
  
  throw new Error('Método não suportado');
}

// Função que executa o refresh token via cookie httpOnly
async function requestRefresh(): Promise<{ access_token: string; user: User }> {
  const response = await refreshClient.post('/auth/refresh');
  return response.data;
}

function processRefreshQueue(newToken: string | null) {
  refreshQueue.forEach((cb) => {
    try {
      cb(newToken);
    } catch {}
  });
  refreshQueue = [];
}

// Interceptor de response: trata 401 com refresh automático
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfig | undefined;

    const status = error.response?.status;
    const originalUrl = originalRequest?.url || '';

    // Se for 401 em login ou refresh, não tentar novamente
    if (status === 401 && originalRequest && !/\/auth\/(login|refresh)/.test(originalUrl)) {
      if (originalRequest._retry) {
        // Já tentamos uma vez, propagar erro e efetuar logout
        clearAccessToken();
        logoutListeners.forEach((l) => l());
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      // Se já existe um refresh em andamento, enfileirar a requisição
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            // Atualiza o header e re-tenta
            originalRequest.headers = originalRequest.headers ?? {};
            (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            resolve(instance(originalRequest));
          });
        });
      }

      // Inicia o refresh
      isRefreshing = true;
      try {
        const data = await requestRefresh();
        const newToken = data.access_token;
        setAccessToken(newToken);

        // Notifica listeners de refresh bem-sucedido
        refreshListeners.forEach((l) => l({ user: data.user, accessToken: newToken }));

        processRefreshQueue(newToken);
        // Re-executa a requisição original
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshErr) {
        // Falha no refresh: limpar token, notificar logout e propagar
        clearAccessToken();
        logoutListeners.forEach((l) => l());
        processRefreshQueue(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// APIs de autenticação
/**
 * POST /auth/login
 * Realizar login no sistema
 * Autenticação: Não requerida
 * Body: { login: string, password: string }
 * Resposta: { access_token: string, user: { id, login, role, companyId, name } }
 */
export async function authLogin(login: string, password: string): Promise<{ access_token: string; user: User }> {
  console.log('[authLogin] Tentando login:', { 
    login, 
    url: `${API_BASE_URL}/auth/login`,
    baseURL: API_BASE_URL,
    withCredentials: true
  });
  try {
    const res = await instance.post('/auth/login', { login, password });
    console.log('[authLogin] Sucesso:', res.data);
    
    // Normalizar role da API para o frontend
    if (res.data.user && res.data.user.role) {
      const roleMap: Record<string, string> = {
        'admin': 'admin',
        'company': 'empresa',
        'seller': 'vendedor',
      };
      res.data.user.role = (roleMap[res.data.user.role] || res.data.user.role) as UserRole;
      console.log('[authLogin] Role normalizado:', res.data.user.role);
    }
    
    return res.data;
  } catch (error: any) {
    console.error('[authLogin] Erro:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    throw error;
  }
}

/**
 * POST /auth/logout
 * Fazer logout
 * Autenticação: Não requerida
 * Body: Vazio
 * Resposta: { message: "Logged out" }
 */
export async function authLogout(): Promise<void> {
  try {
    await instance.post('/auth/logout');
  } finally {
    // Sempre limpar o access token em memória
    clearAccessToken();
  }
}

/**
 * POST /auth/refresh
 * Renovar token de acesso
 * Autenticação: Não requerida (usa cookie refresh_token)
 * Body: Vazio
 * Resposta: Mesma estrutura do login
 */
export async function authRefresh(): Promise<{ access_token: string; user: User }> {
  const data = await requestRefresh();
  
  // Normalizar role da API para o frontend
  if (data.user && data.user.role) {
    const roleMap: Record<string, string> = {
      'admin': 'admin',
      'company': 'empresa',
      'seller': 'vendedor',
    };
    data.user.role = (roleMap[data.user.role] || data.user.role) as UserRole;
    console.log('[authRefresh] Role normalizado:', data.user.role);
  }
  
  return data;
}

export const api = instance; // Exporta a instância para uso nos componentes

// Observação: O refresh token NUNCA é salvo no frontend; ele é gerenciado pelo servidor via cookie httpOnly.
