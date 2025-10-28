/**
 * Interceptor para garantir que todas as chamadas de API validem UUIDs
 * antes de enviar requisições ao backend
 */

import { isValidUUID, validateUUID } from './uuid-validator';

/**
 * Valida parâmetros UUID v4 em URLs de API
 * @param url - URL da API
 * @throws Error se encontrar UUID inválido
 */
export function validateUUIDsInURL(url: string): void {
  // Regex para encontrar possíveis UUIDs na URL
  const uuidPattern = /\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\//gi;
  const matches = url.match(uuidPattern);
  
  if (matches) {
    matches.forEach(match => {
      // Remover as barras
      const possibleUUID = match.replace(/\//g, '');
      
      // Validar se é UUID v4
      if (!isValidUUID(possibleUUID)) {
        throw new Error(
          `UUID v4 inválido detectado na URL: ${possibleUUID}. ` +
          `Certifique-se de usar apenas UUIDs v4 válidos no formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
        );
      }
    });
  }
}

/**
 * Valida propriedades ID em objetos de dados
 * @param data - Dados para validar
 * @param strict - Se true, lança erro; se false, apenas avisa
 */
export function validateUUIDsInData(data: any, strict: boolean = false): void {
  if (!data || typeof data !== 'object') {
    return;
  }
  
  const validateObject = (obj: any, path: string = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Validar propriedades que terminam com 'Id' ou são 'id'
      if ((key === 'id' || key.endsWith('Id')) && typeof value === 'string' && value) {
        if (!isValidUUID(value)) {
          const message = `UUID v4 inválido detectado em ${currentPath}: ${value}. Esperado formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`;
          
          if (strict) {
            throw new Error(message);
          } else {
            console.warn(message);
          }
        }
      }
      
      // Validar arrays
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            validateObject(item, `${currentPath}[${index}]`);
          }
        });
      }
      
      // Validar objetos aninhados
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        validateObject(value, currentPath);
      }
    }
  };
  
  validateObject(data);
}

/**
 * Wrapper para fetch que valida UUIDs
 * @param url - URL da API
 * @param options - Opções do fetch
 * @returns Promise com resposta
 */
export async function fetchWithUUIDValidation(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Validar UUIDs na URL
  validateUUIDsInURL(url);
  
  // Validar UUIDs no body se for POST/PUT/PATCH
  if (options?.body && typeof options.body === 'string') {
    try {
      const data = JSON.parse(options.body);
      validateUUIDsInData(data, false); // Modo não estrito para não bloquear requisições
    } catch (e) {
      // Ignorar se não for JSON válido
    }
  }
  
  return fetch(url, options);
}

/**
 * Cria um interceptor para axios
 */
export function createAxiosUUIDInterceptor() {
  return {
    request: (config: any) => {
      // Validar URL
      if (config.url) {
        try {
          validateUUIDsInURL(config.url);
        } catch (error) {
          console.error('UUID validation error in request:', error);
          throw error;
        }
      }
      
      // Validar data
      if (config.data) {
        try {
          validateUUIDsInData(config.data, false);
        } catch (error) {
          console.warn('UUID validation warning in request data:', error);
        }
      }
      
      return config;
    },
    
    response: (response: any) => {
      // Validar response data
      if (response.data) {
        try {
          validateUUIDsInData(response.data, false);
        } catch (error) {
          console.warn('UUID validation warning in response data:', error);
        }
      }
      
      return response;
    },
    
    error: (error: any) => {
      return Promise.reject(error);
    },
  };
}

/**
 * Sanitiza UUIDs em um objeto (apenas formatação, sem conversões)
 * @param data - Dados para sanitizar
 * @returns Dados sanitizados
 */
export function sanitizeUUIDsInObject<T>(data: T): T {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sanitize = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Sanitizar campos ID (apenas formatação, não conversão)
        if ((key === 'id' || key.endsWith('Id')) && typeof value === 'string') {
          // Apenas validar se é UUID válido e formatar
          if (isValidUUID(value)) {
            result[key] = value.trim().toLowerCase();
          } else {
            throw new Error(`UUID v4 inválido em ${key}: ${value}. A aplicação usa apenas UUIDs v4.`);
          }
        } else {
          result[key] = sanitize(value);
        }
      }
      
      return result;
    }
    
    return obj;
  };
  
  return sanitize(data);
}




