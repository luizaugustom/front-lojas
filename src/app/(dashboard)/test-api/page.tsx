'use client';

import { useState } from 'react';
import {
  TestTube,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export interface SmokeTestResult {
  name: string;
  group: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  durationMs?: number;
}

const SMOKE_TESTS: { name: string; group: string; method: 'GET' | 'POST'; path: string }[] = [
  { name: 'Listar Admins', group: 'Auth/Admin', method: 'GET', path: '/admin' },
  { name: 'Listar Empresas', group: 'Empresas', method: 'GET', path: '/company' },
  { name: 'Listar Vendedores', group: 'Vendedores', method: 'GET', path: '/seller' },
  { name: 'Listar Produtos', group: 'Produtos', method: 'GET', path: '/product' },
  { name: 'Listar Clientes', group: 'Clientes', method: 'GET', path: '/customer' },
  { name: 'Listar Vendas', group: 'Vendas', method: 'GET', path: '/sale' },
  { name: 'Listar Contas a Pagar', group: 'Contas a Pagar', method: 'GET', path: '/bill-to-pay' },
  { name: 'Módulo Fiscal', group: 'Fiscal', method: 'GET', path: '/fiscal' },
  { name: 'Impressoras', group: 'Impressão', method: 'GET', path: '/printer' },
  { name: 'Relatórios', group: 'Relatórios', method: 'GET', path: '/reports' },
  { name: 'WhatsApp', group: 'WhatsApp', method: 'GET', path: '/whatsapp' },
  { name: 'Upload', group: 'Upload', method: 'GET', path: '/upload' },
  { name: 'N8N', group: 'Integrações', method: 'GET', path: '/n8n' },
  { name: 'Fechamento de Caixa', group: 'Caixa', method: 'GET', path: '/cash-closure' },
];

export default function TestApiPage() {
  const { api } = useAuth();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<SmokeTestResult[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runAllTests = async () => {
    setRunning(true);
    setResults([]);
    const newResults: SmokeTestResult[] = [];

    for (const test of SMOKE_TESTS) {
      const start = Date.now();
      try {
        const response =
          test.method === 'GET'
            ? await api.get(test.path)
            : await api.post(test.path, {});
        const durationMs = Date.now() - start;
        const statusCode = response?.status ?? 200;
        const success = statusCode >= 200 && statusCode < 300;
        newResults.push({
          name: test.name,
          group: test.group,
          success,
          statusCode,
          durationMs,
          error: success ? undefined : response?.data?.message || `HTTP ${statusCode}`,
        });
      } catch (err: any) {
        const durationMs = Date.now() - start;
        const statusCode = err?.response?.status;
        const error =
          err?.response?.data?.message || err?.message || (statusCode ? `HTTP ${statusCode}` : 'Erro de rede');
        newResults.push({
          name: test.name,
          group: test.group,
          success: false,
          statusCode,
          error,
          durationMs,
        });
      }
      setResults([...newResults]);
    }

    setLastRun(new Date());
    setRunning(false);

    const passed = newResults.filter((r) => r.success).length;
    const total = newResults.length;
    if (passed === total) {
      toast.success(`Todos os ${total} testes passaram.`);
    } else {
      toast.error(`${total - passed} de ${total} testes falharam.`);
    }
  };

  const passedCount = results.filter((r) => r.success).length;
  const failedCount = results.length - passedCount;
  const groups = Array.from(new Set(results.map((r) => r.group)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            Testes da API
          </h1>
          <p className="text-muted-foreground mt-1">
            Execute smoke tests nos principais endpoints da API (somente admin).
          </p>
        </div>
        <Button
          onClick={runAllTests}
          disabled={running}
          size="lg"
        >
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Executar todos os testes
            </>
          )}
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Info className="h-5 w-5" />
            Como funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900 dark:text-blue-300">
          <p>
            Os testes usam seu token atual (admin) e fazem requisições GET nos endpoints listados.
            Cada endpoint que retornar 2xx é considerado sucesso.
          </p>
          <p>
            Certifique-se de que a API está rodando e que você está logado como administrador.
          </p>
        </CardContent>
      </Card>

      {lastRun && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Última execução: {lastRun.toLocaleString('pt-BR')}</span>
          {results.length > 0 && (
            <span>
              {passedCount} passaram, {failedCount} falharam
            </span>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group}>
              <CardHeader>
                <CardTitle className="text-lg">{group}</CardTitle>
                <CardDescription>
                  {results.filter((r) => r.group === group).filter((r) => r.success).length} /{' '}
                  {results.filter((r) => r.group === group).length} passaram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results
                    .filter((r) => r.group === group)
                    .map((r, i) => (
                      <li
                        key={`${r.group}-${r.name}-${i}`}
                        className="flex items-center justify-between gap-4 py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {r.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                          )}
                          <span className="font-medium">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {r.durationMs != null && <span>{r.durationMs}ms</span>}
                          {r.statusCode != null && <span>HTTP {r.statusCode}</span>}
                          {r.error && (
                            <span className="text-red-600 dark:text-red-400 max-w-xs truncate" title={r.error}>
                              {r.error}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!running && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Clique em &quot;Executar todos os testes&quot; para rodar os smoke tests da API.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
