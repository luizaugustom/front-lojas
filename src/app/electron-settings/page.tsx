"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiConfig, setApiConfig, isElectron } from '@/lib/electron-adapter';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ElectronSettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState({
    url: '',
    timeout: 30000,
    retryAttempts: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isElectron()) {
      router.push('/dashboard');
      return;
    }

    loadConfig();
  }, [router]);

  const loadConfig = async () => {
    try {
      const apiConfig = await getApiConfig();
      setConfig(apiConfig);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await setApiConfig(config);
      if (result.success) {
        toast.success('Configuração salva com sucesso');
      } else {
        toast.error('Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Configurações do Aplicativo</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configuração da API</CardTitle>
          <CardDescription>
            Configure a URL do servidor da API. Essa configuração é usada para conectar ao backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">URL da API</Label>
            <Input
              id="api-url"
              type="url"
              placeholder="http://localhost:3000"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              Exemplo: http://192.168.1.100:3000 ou https://api.seudominio.com
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (ms)</Label>
            <Input
              id="timeout"
              type="number"
              value={config.timeout}
              onChange={(e) =>
                setConfig({ ...config, timeout: parseInt(e.target.value) || 30000 })
              }
            />
            <p className="text-sm text-gray-500">
              Tempo máximo de espera para requisições (em milissegundos)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retries">Tentativas de Retry</Label>
            <Input
              id="retries"
              type="number"
              min="0"
              max="5"
              value={config.retryAttempts}
              onChange={(e) =>
                setConfig({ ...config, retryAttempts: parseInt(e.target.value) || 3 })
              }
            />
            <p className="text-sm text-gray-500">
              Número de tentativas em caso de falha na requisição
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="font-semibold">Plataforma:</dt>
              <dd>{typeof window !== 'undefined' && (window as any).electron?.platform}</dd>
            </div>
            <div>
              <dt className="font-semibold">Modo:</dt>
              <dd>Aplicativo Desktop (Electron)</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

