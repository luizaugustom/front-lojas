'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Eye,
  Lock,
  Save,
  Store,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/apiClient';
import { handleApiError } from '@/lib/handleApiError';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DEFAULT_CATALOG_COLORS,
  HEX_COLOR_PATTERN,
  mergeCatalogColors,
  type CatalogColors,
} from '@/lib/catalog-colors';

interface CatalogPageConfig {
  catalogPageUrl: string | null;
  catalogPageEnabled: boolean;
  catalogPageAllowed: boolean | null;
  catalogColors?: CatalogColors | null;
  pageUrl: string | null;
}

export interface CatalogoSettingsProps {
  locked?: boolean;
  lockReason?: string;
}

const PUBLIC_SITE_URL = (
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://montshop.app'
).replace(/\/+$/, '');

const withPublicSiteUrl = (path?: string | null) => {
  if (!path) return null;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_SITE_URL}${normalizedPath}`;
};

const COLOR_FIELDS: { key: keyof CatalogColors; label: string }[] = [
  { key: 'backgroundColor', label: 'Fundo da página' },
  { key: 'headerBackgroundColor', label: 'Fundo do cabeçalho' },
  { key: 'headerTextColor', label: 'Texto do cabeçalho' },
  { key: 'footerBackgroundColor', label: 'Fundo do rodapé' },
  { key: 'footerTextColor', label: 'Texto do rodapé' },
  { key: 'textColor', label: 'Texto do conteúdo' },
];

export function CatalogoSettings({ locked, lockReason }: CatalogoSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [config, setConfig] = useState<CatalogPageConfig | null>(null);
  const [form, setForm] = useState<{
    url: string;
    enabled: boolean;
    colors: CatalogColors;
  }>({
    url: '',
    enabled: false,
    colors: DEFAULT_CATALOG_COLORS,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<CatalogPageConfig>(
        '/company/my-company/catalog-page',
      );
      setConfig(data);
      setForm({
        url: data.catalogPageUrl ?? '',
        enabled: Boolean(data.catalogPageEnabled),
        colors: mergeCatalogColors(data.catalogColors),
      });
    } catch (error) {
      console.error('Erro ao carregar configurações do catálogo:', error);
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (locked) {
    return (
      <Alert className="border-destructive/40 bg-destructive/5">
        <Lock className="h-4 w-4 text-destructive" aria-hidden />
        <AlertDescription>
          {lockReason ?? 'Esta categoria está bloqueada para a sua empresa.'}
        </AlertDescription>
      </Alert>
    );
  }

  const handleToggle = async (next: boolean) => {
    if (!config?.catalogPageAllowed) return;
    try {
      setToggling(true);
      await api.patch('/company/my-company/catalog-page', {
        catalogPageEnabled: next,
      });
      setForm((prev) => ({ ...prev, enabled: next }));
      toast.success(
        next
          ? 'Página de catálogo ativada!'
          : 'Página de catálogo desativada.',
      );
      await load();
    } catch (error) {
      handleApiError(error);
      setForm((prev) => ({ ...prev, enabled: !next }));
    } finally {
      setToggling(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (form.enabled && !form.url.trim()) {
        toast.error('Informe uma URL para a página de catálogo');
        return;
      }
      if (!Object.values(form.colors).every((value) => HEX_COLOR_PATTERN.test(value))) {
        toast.error('Informe cores no formato #RRGGBB');
        return;
      }
      const updates: Record<string, unknown> = {
        catalogColors: form.colors,
      };
      const trimmed = form.url.trim();
      if (trimmed) updates.catalogPageUrl = trimmed;
      else if (config?.catalogPageUrl) updates.catalogPageUrl = null;
      if (form.enabled !== Boolean(config?.catalogPageEnabled)) {
        updates.catalogPageEnabled = form.enabled;
      }
      await api.patch('/company/my-company/catalog-page', updates);
      toast.success('Configurações salvas com sucesso!');
      await load();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const previewUrl = form.url.trim()
    ? withPublicSiteUrl(`/catalog/${form.url.trim()}`)
    : null;
  const canToggle = config?.catalogPageAllowed !== false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Página de Catálogo Pública
        </CardTitle>
        <CardDescription>
          Ative uma página pública com seus produtos e personalize as cores do tema claro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {config?.catalogPageAllowed === false ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Permissão não autorizada</AlertTitle>
            <AlertDescription>
              A empresa não tem permissão para usar catálogo digital. Entre em
              contato com o administrador para autorizar esta funcionalidade.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <p className="font-medium">
              {form.enabled ? 'Página Ativa' : 'Página Desativada'}
            </p>
            <p className="text-sm text-muted-foreground">
              {form.enabled
                ? 'Os clientes podem acessar a página pública.'
                : 'A página pública está oculta.'}
            </p>
            {form.enabled && previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
              >
                <Eye className="h-3 w-3" aria-hidden />
                {previewUrl}
              </a>
            ) : null}
          </div>
          <Switch
            checked={form.enabled}
            onCheckedChange={handleToggle}
            disabled={!canToggle || toggling || saving}
            aria-label="Ativar página de catálogo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="catalog-url">
            URL da Página (letras minúsculas, números, hífen e underscore)
          </Label>
          <Input
            id="catalog-url"
            value={form.url}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                url: e.target.value.toLowerCase(),
              }))
            }
            placeholder="exemplo: masolucoes"
            disabled={saving || toggling || !canToggle}
          />
          <p className="text-xs text-muted-foreground">
            A página será acessível em{' '}
            <span className="font-mono">
              {PUBLIC_SITE_URL}/catalog/
              {form.url.trim() || 'sua-url'}
            </span>
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <div>
            <p className="font-medium">Aparência</p>
            <p className="text-sm text-muted-foreground">
              O catálogo público usa apenas o tema claro. Os botões continuam com a
              cor da marca.
            </p>
          </div>
          <div
            className="overflow-hidden rounded-lg border border-border"
            aria-hidden
          >
            <div
              className="px-3 py-2 text-sm font-medium"
              style={{
                backgroundColor: form.colors.headerBackgroundColor,
                color: form.colors.headerTextColor,
              }}
            >
              Cabeçalho
            </div>
            <div
              className="px-3 py-5 text-sm"
              style={{
                backgroundColor: form.colors.backgroundColor,
                color: form.colors.textColor,
              }}
            >
              Conteúdo do catálogo
            </div>
            <div
              className="px-3 py-2 text-xs"
              style={{
                backgroundColor: form.colors.footerBackgroundColor,
                color: form.colors.footerTextColor,
              }}
            >
              Rodapé
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`catalog-color-${key}`}>{label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    id={`catalog-color-${key}`}
                    type="color"
                    value={
                      HEX_COLOR_PATTERN.test(form.colors[key])
                        ? form.colors[key]
                        : DEFAULT_CATALOG_COLORS[key]
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, [key]: e.target.value },
                      }))
                    }
                    className="h-10 w-12 cursor-pointer rounded border"
                    disabled={saving || toggling || !canToggle}
                    aria-label={label}
                  />
                  <Input
                    value={form.colors[key]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, [key]: e.target.value },
                      }))
                    }
                    className="font-mono"
                    placeholder={DEFAULT_CATALOG_COLORS[key]}
                    disabled={saving || toggling || !canToggle}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || toggling || !canToggle}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar configurações
            </>
          )}
        </Button>

        {form.enabled && form.url.trim() ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-950">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Como funciona o catálogo
            </p>
            <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">
              Lista seus produtos com estoque disponível, com busca por
              nome/categoria/descrição, filtros (categoria, faixa de preço) e
              ordenação. O cliente adiciona produtos ao carrinho e finaliza o
              pedido via WhatsApp da empresa. O catálogo permanece no tema claro,
              com as cores configuradas acima.
            </p>
            <a
              href={previewUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-900 hover:underline dark:text-blue-100"
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              Abrir página pública
            </a>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default CatalogoSettings;