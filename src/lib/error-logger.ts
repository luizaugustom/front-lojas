/**
 * Serviço de logging de erros para produção
 * Captura e envia erros para análise
 */

import { logger } from '@/lib/logger';

interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  errorType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

const ERROR_API_ENDPOINT = process.env.NEXT_PUBLIC_ERROR_API_ENDPOINT;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private readonly MAX_LOGS = 50;
  private readonly FLUSH_INTERVAL = 5000; // 5 segundos

  /**
   * Loga um erro com informações contextuais
   */
  logError(
    error: Error | unknown,
    context?: {
      userId?: string;
      severity?: ErrorLog['severity'];
      additionalData?: Record<string, any>;
    }
  ): void {
    try {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      const log: ErrorLog = {
        message: errorObj.message || 'Erro desconhecido',
        stack: errorObj.stack,
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        timestamp: new Date().toISOString(),
        userId: context?.userId,
        errorType: errorObj.name || 'Error',
        severity: context?.severity || this.determineSeverity(errorObj),
        context: context?.additionalData,
      };

      // No ambiente de desenvolvimento, sempre logar no console
      if (!IS_PRODUCTION) {
        console.group('🔴 Error Logged');
        console.error('Message:', log.message);
        console.error('Type:', log.errorType);
        console.error('Severity:', log.severity);
        console.error('Stack:', log.stack);
        console.error('Context:', log.context);
        console.error('URL:', log.url);
        console.groupEnd();
      }

      // Adiciona à fila
      this.logs.push(log);

      // Limita o tamanho da fila
      if (this.logs.length > this.MAX_LOGS) {
        this.logs.shift();
      }

      // Agenda o flush
      this.scheduleFlush();
    } catch (loggingError) {
      // Se falhar ao logar, pelo menos tenta no console
      console.error('Falha ao logar erro:', loggingError);
      console.error('Erro original:', error);
    }
  }

  /**
   * Determina a severidade do erro baseado no tipo e mensagem
   */
  private determineSeverity(error: Error): ErrorLog['severity'] {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Erros críticos
    if (
      name.includes('network') ||
      name.includes('timeout') ||
      message.includes('failed to fetch') ||
      message.includes('network error')
    ) {
      return 'critical';
    }

    // Erros altos
    if (
      name.includes('syntax') ||
      name.includes('reference') ||
      name.includes('type')
    ) {
      return 'high';
    }

    // Erros médios
    if (name.includes('validation') || name.includes('invalid')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Agenda o flush dos logs
   */
  private scheduleFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Envia os logs acumulados para o servidor
   */
  async flush(): Promise<void> {
    if (this.logs.length === 0) {
      return;
    }

    const logsToSend = [...this.logs];
    this.logs = [];

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    // Se não há endpoint configurado, apenas loga no console em produção
    if (!ERROR_API_ENDPOINT || !IS_PRODUCTION) {
      if (IS_PRODUCTION) {
        logger.warn('Error API endpoint não configurado. Erros não serão enviados.');
      }
      return;
    }

    try {
      await fetch(ERROR_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
        keepalive: true, // Garante que a requisição seja enviada mesmo se a página for fechada
      });
    } catch (error) {
      // Se falhar ao enviar, recoloca os logs na fila (até o limite)
      console.error('Falha ao enviar logs de erro:', error);
      this.logs.unshift(...logsToSend.slice(-10)); // Mantém apenas os 10 mais recentes
    }
  }

  /**
   * Loga um erro crítico imediatamente (sem aguardar flush)
   */
  async logCriticalError(
    error: Error | unknown,
    context?: {
      userId?: string;
      additionalData?: Record<string, any>;
    }
  ): Promise<void> {
    this.logError(error, { ...context, severity: 'critical' });
    await this.flush();
  }
}

// Singleton
export const errorLogger = new ErrorLogger();

// Flush automático quando a página for fechada
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    errorLogger.flush();
  });

  // Flush periódico para garantir que logs não sejam perdidos
  setInterval(() => {
    errorLogger.flush();
  }, 30000); // A cada 30 segundos
}

/**
 * Helper para logar erros de API
 */
export function logApiError(
  error: unknown,
  endpoint: string,
  method: string,
  userId?: string
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  errorLogger.logError(errorObj, {
    userId,
    severity: 'high',
    additionalData: {
      endpoint,
      method,
      errorDetails: error instanceof Error ? {
        name: error.name,
        message: error.message,
      } : { error: String(error) },
    },
  });
}

/**
 * Helper para logar erros de validação
 */
export function logValidationError(
  error: unknown,
  formName: string,
  userId?: string
): void {
  errorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
    userId,
    severity: 'medium',
    additionalData: {
      formName,
      errorType: 'validation',
    },
  });
}
