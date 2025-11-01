import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { logApiError } from './error-logger';

export interface ApiErrorDetails {
  message: string;
  status?: number;
  code?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
}

/**
 * Trata erros de API de forma robusta com logging
 */
export function handleApiError(
  error: unknown,
  context?: {
    endpoint?: string;
    method?: string;
    userId?: string;
    showToast?: boolean;
  }
): ApiErrorDetails {
  const showToast = context?.showToast !== false; // Default: true
  let message = 'Erro desconhecido';
  let status: number | undefined;
  let code: string | undefined;
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Extrai informações do erro
    status = axiosError.response?.status;
    const data = axiosError.response?.data as any;
    const endpoint = context?.endpoint || axiosError.config?.url || 'unknown';
    const method = context?.method || axiosError.config?.method?.toUpperCase() || 'unknown';
    
    // Loga o erro para análise
    logApiError(error, endpoint, method, context?.userId);
    
    if (axiosError.response) {
      // Erro com resposta do servidor
      if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else if (data?.errors) {
        // Array de erros de validação
        if (Array.isArray(data.errors)) {
          message = data.errors
            .map((err: any) => {
              if (typeof err === 'string') return err;
              if (err.message) return err.message;
              if (err.field && err.message) return `${err.field}: ${err.message}`;
              return JSON.stringify(err);
            })
            .join(', ');
        } else if (typeof data.errors === 'object') {
          // Objeto com erros por campo
          const fieldErrors = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${msgs}`;
            })
            .join('; ');
          message = fieldErrors || JSON.stringify(data.errors);
        } else {
          message = JSON.stringify(data.errors);
        }
      } else if (status === 400 && data?.message?.includes('must be a UUID')) {
        message = 'Erro: O sistema espera IDs no formato UUID. Entre em contato com o suporte técnico.';
      } else {
        message = `Erro do servidor (${status || 'unknown'}): ${axiosError.message}`;
      }
      
      code = data?.code || data?.errorCode;
    } else if (axiosError.request) {
      // Erro de rede (sem resposta do servidor)
      message = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      
      // Loga como erro crítico
      logApiError(
        new Error(`Network Error: ${axiosError.message}`),
        endpoint,
        method,
        context?.userId
      );
    } else {
      // Erro na configuração da requisição
      message = `Erro ao processar requisição: ${axiosError.message}`;
    }
  } else if (error instanceof Error) {
    // Erro padrão do JavaScript
    message = error.message;
    logApiError(error, context?.endpoint || 'unknown', context?.method || 'unknown', context?.userId);
  } else {
    // Erro desconhecido
    message = String(error) || 'Erro desconhecido';
    logApiError(
      new Error(message),
      context?.endpoint || 'unknown',
      context?.method || 'unknown',
      context?.userId
    );
  }
  
  // Mostra toast apenas se solicitado
  if (showToast) {
    toast.error(message, {
      duration: status && status >= 500 ? 6000 : 4000, // Erros do servidor ficam mais tempo
    });
  }
  
  return {
    message,
    status,
    code,
    endpoint: context?.endpoint,
    method: context?.method,
    userId: context?.userId,
  };
}