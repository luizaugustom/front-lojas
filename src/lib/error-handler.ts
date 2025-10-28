import { toast } from 'sonner';

interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Manipula erros de requisições HTTP
 */
export function handleApiError(error: any): void {
  console.error('API Error:', error);

  if (error.response) {
    // O servidor respondeu com um código de status fora do range 2xx
    const data = error.response.data as ErrorResponse;
    const message = data.message || data.error || 'Erro ao processar requisição';
    
    switch (error.response.status) {
      case 400:
        toast.error(`Requisição inválida: ${message}`);
        break;
      case 401:
        toast.error('Sessão expirada. Faça login novamente.');
        // Aqui você pode adicionar lógica para redirecionar para login
        break;
      case 403:
        toast.error('Você não tem permissão para realizar esta ação.');
        break;
      case 404:
        toast.error('Recurso não encontrado.');
        break;
      case 409:
        toast.error(`Conflito: ${message}`);
        break;
      case 422:
        toast.error(`Dados inválidos: ${message}`);
        break;
      case 500:
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
        break;
      default:
        toast.error(message);
    }
  } else if (error.request) {
    // A requisição foi feita mas não houve resposta
    toast.error('Não foi possível conectar ao servidor. Verifique sua conexão.');
  } else {
    // Algo aconteceu ao configurar a requisição
    toast.error('Erro ao processar requisição.');
  }
}

/**
 * Manipula erros gerais
 */
export function handleError(error: any, defaultMessage?: string): void {
  console.error('Error:', error);
  
  const message = error.message || defaultMessage || 'Ocorreu um erro inesperado';
  toast.error(message);
}

/**
 * Exibe mensagem de sucesso
 */
export function showSuccess(message: string): void {
  toast.success(message);
}

/**
 * Exibe mensagem de aviso
 */
export function showWarning(message: string): void {
  toast.warning(message);
}

/**
 * Exibe mensagem de informação
 */
export function showInfo(message: string): void {
  toast.info(message);
}

export class ErrorHandler {
  /**
   * Manipula erros de requisições HTTP
   */
  static handleApiError = handleApiError;

  /**
   * Manipula erros gerais
   */
  static handleError = handleError;

  /**
   * Exibe mensagem de sucesso
   */
  static showSuccess = showSuccess;

  /**
   * Exibe mensagem de aviso
   */
  static showWarning = showWarning;

  /**
   * Exibe mensagem de informação
   */
  static showInfo = showInfo;
}

/**
 * Função auxiliar para manipular erros de forma assíncrona
 */
export async function handleAsyncError<T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<[T | null, any]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    handleApiError(error);
    return [null, error];
  }
}
