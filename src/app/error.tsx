'use client';

import { useEffect } from 'react';
import type { ErrorProps as NextErrorProps } from 'next/error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { errorLogger } from '@/lib/error-logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Loga o erro automaticamente
    errorLogger.logError(error, {
      severity: 'high',
      additionalData: {
        digest: error.digest,
        errorBoundary: true,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      },
    });
  }, [error]);

  const handleReportError = () => {
    // Pode abrir um modal de report ou redirecionar
    errorLogger.logCriticalError(error, {
      additionalData: {
        userReported: true,
        timestamp: new Date().toISOString(),
      },
    });
    alert('Erro reportado com sucesso! Nossa equipe foi notificada.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-2xl">Algo deu errado</CardTitle>
          </div>
          <CardDescription>
            Ocorreu um erro inesperado. Nossa equipe foi automaticamente notificada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Detalhes do erro em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono text-muted-foreground break-all">
                <strong>Erro:</strong> {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer text-muted-foreground">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64 p-2 bg-background rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
              {error.digest && (
                <p className="text-xs mt-2 text-muted-foreground">
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Mensagem amigável para produção */}
          {process.env.NODE_ENV === 'production' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Se o problema persistir, entre em contato com o suporte técnico.
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
            <Button onClick={reset} className="flex-1" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              className="flex-1"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir para início
            </Button>
            {process.env.NODE_ENV === 'production' && (
              <Button
                onClick={handleReportError}
                className="flex-1"
                variant="outline"
              >
                <Bug className="mr-2 h-4 w-4" />
                Reportar problema
              </Button>
            )}
          </div>

          {/* Informações úteis */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Se o problema persistir, tente:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Recarregar a página</li>
              <li>Limpar o cache do navegador</li>
              <li>Verificar sua conexão com a internet</li>
              <li>Contatar o suporte técnico</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
