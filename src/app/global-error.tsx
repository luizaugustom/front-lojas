'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorLogger } from '@/lib/error-logger';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Loga o erro crítico automaticamente
    errorLogger.logCriticalError(error, {
      additionalData: {
        digest: error.digest,
        globalError: true,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      },
    });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <CardTitle className="text-2xl">Erro Crítico</CardTitle>
              </div>
              <CardDescription>
                Ocorreu um erro crítico que impediu o carregamento da aplicação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detalhes do erro em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                    <strong>Erro:</strong> {error.message}
                  </p>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer text-gray-600 dark:text-gray-400">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-64 p-2 bg-white dark:bg-gray-900 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                  {error.digest && (
                    <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* Mensagem para produção */}
              {process.env.NODE_ENV === 'production' && (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Um erro crítico ocorreu e nossa equipe foi notificada automaticamente.
                    Por favor, tente recarregar a página ou entre em contato com o suporte técnico.
                    {error.digest && (
                      <span className="block mt-2 text-xs">
                        Código de referência: <code className="font-mono">{error.digest}</code>
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar página
                </Button>
                <Button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/';
                    }
                  }}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir para início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}