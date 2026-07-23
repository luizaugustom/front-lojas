'use client';

import { useCallback, useEffect, useState } from 'react';
import { Lock, Save, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import { handleApiError } from '@/lib/handleApiError';

const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://montshop.app').replace(/\/+$/, '');

interface CatalogConfig {
  catalogPageUrl?: string;
  catalogPageEnabled?: boolean;
  catalogPageAllowed?: boolean;
}

const withPublicSiteUrl = (path?: string | null) => {
  if (!path) return null;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_SITE_URL}${normalizedPath}`;
};

const LoaderBlock = ({ label }: { label: string }) => (
  <div
    role="status"
    aria-live="polite"
    aria-label={label}
    className="flex flex-col items-center justify-center gap-2 py-8"
  >
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export function CatalogoSettings() {
  const { api: authApi } = useAuth();
  const { company } = useCompany();
  const [catalogPageConfig, setCatalogPageConfig] = useState<CatalogConfig | null>(null);
  const [loadingCatalogPage, setLoadingCatalogPage] = useState(false);
  const [updatingCatalogPage, setUpdatingCatalogPage] = useState(false);
  const [catalogPageForm, setCatalogPageForm] = useState({
    url: '',
    enabled: false,
  });

  const plan = (company?.plan ?? '').toString().toUpperCase();
  const isPro = plan === 'PRO';

  const loadCatalogPageConfig = useCallback(async () => {
    try {
      setLoadingCatalogPage(true);
      const response = await authApi.get('/company/my-company/catalog-page');
      const data = (response.data ?? {}) as CatalogConfig;
      setCatalogPageConfig(data);
      setCatalogPageForm({
        url: data.catalogPageUrl || '',
        enabled: data.catalogPageEnabled || false,
      });
      if (data.catalogPageAllowed === false) {
        setCatalogPageForm((prev) => ({ ...prev, enabled: false }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da página de catálogo:', error);
      setCatalogPageConfig(null);
    } finally {
      setLoadingCatalogPage(false);
    }
  }, [authApi]);

  useEffect(() => {
    void loadCatalogPageConfig();
  }, [loadCatalogPageConfig]);

  const catalogPreviewUrl = catalogPageForm.url
    ? withPublicSiteUrl(`/catalog/${catalogPageForm.url}`)
    : null;

  const handleUpdateCatalogPage = async () => {
    try {
      setUpdatingCatalogPage(true);

      if (catalogPageForm.enabled && plan && plan !== 'PRO') {
        toast.error(
          'O catálogo público está disponível apenas para empresas com plano Pro. Faça upgrade para utilizar esta funcionalidade.',
        );
        setCatalogPageForm((prev) => ({ ...prev, enabled: false }));
        return;
      }
      if (catalogPageForm.enabled && !catalogPageForm.url) {
        toast.error('Informe uma URL para a página de catálogo');
        return;
      }

      const updates: CatalogConfig = {};
      if (catalogPageForm.url) {
        updates.catalogPageUrl = catalogPageForm.url;
      }
      if (
        catalogPageForm.enabled !== catalogPageConfig?.catalogPageEnabled ||
        catalogPageConfig === null
      ) {
        updates.catalogPageEnabled = catalogPageForm.enabled;
      }

      await authApi.patch('/company/my-company/catalog-page', updates);
      toast.success('Configurações da página de catálogo atualizadas com sucesso!');
      await loadCatalogPageConfig();
    } catch (error) {
      console.error('Erro ao atualizar página de catálogo:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (message?.includes('plano PRO') || message?.includes('plano Pro')) {
        toast.error('O catálogo público está disponível apenas para empresas com plano Pro.');
        setCatalogPageForm((prev) => ({ ...prev, enabled: false }));
      } else {
        handleApiError(error);
      }
    } finally {
      setUpdatingCatalogPage(false);
    }
  };

  const handleToggleCatalogEnabled = async (nextEnabled: boolean) => {
    if (!nextEnabled) {
      try {
        setUpdatingCatalogPage(true);
        await authApi.patch('/company/my-company/catalog-page', { catalogPageEnabled: false });
        setCatalogPageForm((prev) => ({ ...prev, enabled: false }));
        toast.success('Página de catálogo desativada.');
        await loadCatalogPageConfig();
      } catch (error) {
        console.error('Erro ao desativar catálogo:', error);
        setCatalogPageForm((prev) => ({ ...prev, enabled: true }));
        handleApiError(error);
      } finally {
        setUpdatingCatalogPage(false);
      }
      return;
    }

    try {
      setUpdatingCatalogPage(true);
      await authApi.patch('/company/my-company/catalog-page', { catalogPageEnabled: true });
      setCatalogPageForm((prev) => ({ ...prev, enabled: true }));
      toast.success('Página de catálogo ativada!');
      await loadCatalogPageConfig();
    } catch (error) {
      console.error('Erro ao ativar catálogo:', error);
      setCatalogPageForm((prev) => ({ ...prev, enabled: false }));
      handleApiError(error);
    } finally {
      setUpdatingCatalogPage(false);
    }
  };

  const disabledToggle =
    updatingCatalogPage || (plan && !isPro) || catalogPageConfig?.catalogPageAllowed === false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Página de Catálogo Pública
        </CardTitle>
        <CardDescription>
          Crie uma página pública de catálogo para exibir seus produtos na web
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingCatalogPage ? (
          <LoaderBlock label="Carregando..." />
        ) : (
          <>
            {plan && !isPro && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Funcionalidade disponível apenas para plano Pro
                    </p>
                    <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                      Seu plano atual: <strong>{plan}</strong>. Faça upgrade para plano Pro para
                      utilizar o catálogo público.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${catalogPageForm.enabled ? 'bg-green-500' : 'bg-gray-400'}`}
                />
                <div>
                  <p className="font-medium">
                    {catalogPageForm.enabled ? 'Página Ativa' : 'Página Desativada'}
                  </p>
                  {catalogPageForm.enabled && catalogPreviewUrl && (
                    <a
                      href={catalogPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm text-primary hover:underline"
                    >
                      {catalogPreviewUrl}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catalog-url">
                  URL da Página (apenas letras minúsculas, números, hífen e underscore)
                </Label>
                <Input
                  id="catalog-url"
                  value={catalogPageForm.url}
                  onChange={(e) =>
                    setCatalogPageForm({
                      ...catalogPageForm,
                      url: e.target.value.toLowerCase(),
                    })
                  }
                  placeholder="exemplo: masolucoes"
                  disabled={updatingCatalogPage}
                />
                <p className="text-xs text-muted-foreground">
                  Exemplo: se você digitar &quot;masolucoes&quot;, sua página será acessível em{' '}
                  {`${PUBLIC_SITE_URL}/catalog/masolucoes`}
                </p>
              </div>

              {catalogPageConfig?.catalogPageAllowed === false && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                  <div className="flex items-start gap-2">
                    <Lock className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Permissão não autorizada
                      </p>
                      <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                        A empresa não tem permissão para usar catálogo digital. Entre em contato
                        com o administrador para autorizar esta funcionalidade.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Ativar Página</p>
                  <p className="text-sm text-muted-foreground">
                    Torna sua página de catálogo acessível publicamente
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={catalogPageForm.enabled}
                    onChange={(e) => handleToggleCatalogEnabled(e.target.checked)}
                    className="sr-only peer"
                    disabled={disabledToggle}
                  />
                  <div
                    className={`peer-focus:ring-primary/20 h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-focus:ring-4 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white ${
                      disabledToggle ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  />
                </label>
              </div>

              <Button
                onClick={handleUpdateCatalogPage}
                disabled={updatingCatalogPage}
                className="w-full"
              >
                {updatingCatalogPage ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                ℹ️ Sobre a Página de Catálogo
              </p>
              <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                <li>• Lista todos os seus produtos com estoque disponível</li>
                <li>• Exibe fotos, preços e informações dos produtos</li>
                <li>• Mostra suas informações de contato (telefone, email, endereço)</li>
                <li>• Acesso público - não requer login</li>
                <li>• Compartilhe o link com seus clientes!</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default CatalogoSettings;
