'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StorefrontRenderer } from '@/components/storefront/StorefrontRenderer';
import { PublicStorefrontResponse, DEFAULT_THEME } from '@/lib/storefront-types';
import { getApiBaseUrl } from '@/lib/api-base-url';
import { handleApiError } from '@/lib/handleApiError';
import { logger } from '@/lib/logger';
import { Package } from 'lucide-react';

/**
 * Página pública do storefront (renderer novo baseado em website builder).
 *
 * Fluxo:
 * 1. Busca o design publicado em GET /public/storefront/:url
 * 2. Aplica o tema (ThemeProvider) e itera os blocos via StorefrontRenderer
 * 3. Se a empresa ainda não publicou nada, mostra estado vazio amigável
 *
 * A antiga lógica de 937 linhas (cart, modal, versículo, etc.) foi
 * removida porque o storefront novo é totalmente data-driven. As
 * funcionalidades de carrinho/WhatsApp serão reintroduzidas via
 * blocos na Fase 3 (product_grid, product_carousel).
 */
export default function CatalogPageClient() {
  const params = useParams();
  const url = params.url as string;
  const [data, setData] = useState<PublicStorefrontResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        setLoading(true);
        const baseUrl = (
          process.env.NEXT_PUBLIC_PUBLIC_API_URL?.trim() || getApiBaseUrl()
        ).replace(/\/+$/, '');

        const response = await fetch(`${baseUrl}/public/storefront/${url}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Catálogo não encontrado ou desabilitado.');
            return;
          }
          const errorText = await response.text();
          let message = 'Erro ao carregar catálogo';
          try {
            const data = JSON.parse(errorText);
            if (data?.message) message = Array.isArray(data.message) ? data.message[0] : data.message;
          } catch {
            // não era JSON, usa a mensagem padrão
          }
          throw new Error(message);
        }

        const json: PublicStorefrontResponse = await response.json();
        logger.log('✅ Storefront carregado:', json);
        setData(json);
      } catch (err) {
        logger.error('❌ Erro ao buscar storefront:', err);
        setError(handleApiError(err, { showToast: false }).message);
      } finally {
        setLoading(false);
      }
    };

    if (url) fetchStorefront();
  }, [url]);

  // Título da aba
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (data?.company) {
      const title =
        (data.company.fantasyName && String(data.company.fantasyName).trim()) ||
        (data.company.name && String(data.company.name).trim()) ||
        'Catálogo';
      document.title = title;
    } else if (error) {
      document.title = 'Catálogo não encontrado';
    } else if (loading) {
      document.title = 'Carregando catálogo...';
    } else {
      document.title = 'Catálogo';
    }
  }, [data?.company, data?.company?.fantasyName, data?.company?.name, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 text-gray-400 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Catálogo não encontrado
          </h1>
          <p className="mt-2 text-gray-600">
            {error || 'A empresa não possui um catálogo público ativo no momento.'}
          </p>
        </div>
      </div>
    );
  }

  // Estado vazio (empresa ainda não publicou um design)
  if (data.needsSetup || (data.blocks?.length ?? 0) === 0) {
    return <EmptyState companyName={data.company.fantasyName || data.company.name} />;
  }

  return (
    <StorefrontRenderer
      blocks={data.blocks}
      theme={data.theme || DEFAULT_THEME}
    />
  );
}

function EmptyState({ companyName }: { companyName: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--sf-background)' }}
    >
      <div className="text-center max-w-md">
        <Package className="h-16 w-16 text-gray-400 mx-auto" />
        <h1 className="text-2xl font-bold mt-4" style={{ color: 'var(--sf-text)' }}>
          {companyName}
        </h1>
        <p className="mt-2" style={{ color: 'var(--sf-text-muted)' }}>
          O catálogo público desta empresa está em configuração. Em breve
          estará disponível aqui.
        </p>
      </div>
    </div>
  );
}
