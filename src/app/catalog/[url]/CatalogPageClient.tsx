'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { X, MessageCircle, Package } from 'lucide-react';
import { StorefrontRenderer } from '@/components/storefront/StorefrontRenderer';
import {
  PublicStorefrontResponse,
  DEFAULT_THEME,
  CatalogConfig,
} from '@/lib/storefront-types';
import { StorefrontProduct } from '@/components/storefront/StorefrontDataContext';
import {
  SimpleCatalogRenderer,
  type CatalogProduct,
  type CatalogCompany,
} from '@/components/catalog/SimpleCatalogRenderer';
import { getApiBaseUrl } from '@/lib/api-base-url';
import { handleApiError } from '@/lib/handleApiError';
import { logger } from '@/lib/logger';
import { getImageUrl } from '@/lib/image-utils';

interface ProductModalState {
  product: StorefrontProduct;
  photoIndex: number;
}

/**
 * Página pública do storefront (renderer novo baseado em website builder).
 *
 * Fluxo:
 * 1. Busca o design publicado em GET /public/storefront/:url
 * 2. Se houver blocos de produto, busca também os produtos em
 *    GET /public/catalog/:url/products (mantido por compatibilidade)
 * 3. Aplica o tema e itera os blocos via StorefrontRenderer
 * 4. Modal de produto e integração WhatsApp (Fase 4)
 */
export default function CatalogPageClient() {
  const params = useParams();
  const url = params.url as string;
  const searchParams = useSearchParams();

  const [data, setData] = useState<PublicStorefrontResponse | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [promotedProducts, setPromotedProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ProductModalState | null>(null);

  // Catálogo simplificado (V2) — quando a empresa usa CatalogConfig
  const [v2Config, setV2Config] = useState<CatalogConfig | null>(null);
  const [v2Company, setV2Company] = useState<CatalogCompany | null>(null);

  // Fetch do design — tenta V2 primeiro (catálogo simplificado), fallback para V1
  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        setLoading(true);
        const baseUrl = (
          process.env.NEXT_PUBLIC_PUBLIC_API_URL?.trim() || getApiBaseUrl()
        ).replace(/\/+$/, '');

        // 1) Tenta V2 (catálogo simplificado)
        const v2Response = await fetch(`${baseUrl}/public/catalog-v2/${url}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (v2Response.ok) {
          const v2Json = await v2Response.json();
          logger.log('✅ Catálogo simplificado carregado:', v2Json);
          setV2Config(v2Json.config as CatalogConfig);
          setV2Company(v2Json.company as CatalogCompany);
          return;
        }
        if (v2Response.status !== 404) {
          // Erro diferente de 404 — ainda tenta V1 antes de desistir
          logger.warn(`V2 retornou ${v2Response.status}, tentando V1...`);
        }

        // 2) Fallback V1 (website builder)
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
            // ignore
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

  // Fetch dos produtos (só se houver bloco de produto)
  useEffect(() => {
    if (!data) return;
    const hasProductBlock = data.blocks.some((b) =>
      ['product_grid', 'product_carousel', 'featured_products', 'categories'].includes(b.type),
    );
    if (!hasProductBlock) {
      setProducts([]);
      setPromotedProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        const baseUrl = (
          process.env.NEXT_PUBLIC_PUBLIC_API_URL?.trim() || getApiBaseUrl()
        ).replace(/\/+$/, '');
        const response = await fetch(`${baseUrl}/public/catalog/${url}/products`);
        if (!response.ok) return;
        const json = await response.json();
        setProducts(json.products || []);
        setPromotedProducts(json.promotedProducts || []);
      } catch (err) {
        logger.error('❌ Erro ao buscar produtos:', err);
      }
    };

    fetchProducts();
  }, [data, url]);

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

  // Deep link: ?product=:id abre o modal do produto
  useEffect(() => {
    const productId = searchParams.get('product');
    if (!productId || products.length === 0) return;
    const found = [...promotedProducts, ...products].find((p) => p.id === productId);
    if (found && modal?.product.id !== found.id) {
      setModal({ product: found, photoIndex: 0 });
    }
  }, [searchParams, products, promotedProducts, modal?.product.id]);

  const openProduct = useCallback((p: StorefrontProduct) => {
    setModal({ product: p, photoIndex: 0 });
  }, []);

  const onCategoryClick = useCallback((_category: string) => {
    // Fase 7: filtrar storefront por categoria (scroll até grade com filtro)
  }, []);

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

  if (data.needsSetup || (data.blocks?.length ?? 0) === 0) {
    return <EmptyState companyName={data.company.fantasyName || data.company.name} />;
  }

  // Catálogo simplificado (V2) — usa SimpleCatalogRenderer com 3 templates
  if (v2Config && v2Company) {
    const v2Products: CatalogProduct[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price ?? 0),
      imageUrl: (p as any).imageUrl ?? null,
      description: (p as any).description ?? null,
    }));
    return <SimpleCatalogRenderer config={v2Config} company={v2Company} products={v2Products} />;
  }

  return (
    <>
      <StorefrontRenderer
        blocks={data.blocks}
        theme={data.theme || DEFAULT_THEME}
        data={{
          company: data.company,
          products,
          promotedProducts,
          openProduct,
          onCategoryClick,
        }}
      />
      {modal && <ProductModal state={modal} onClose={() => setModal(null)} company={data.company} />}
    </>
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

function ProductModal({
  state,
  onClose,
  company,
}: {
  state: ProductModalState;
  onClose: () => void;
  company: PublicStorefrontResponse['company'];
}) {
  const { product, photoIndex } = state;
  const phoneDigits = (company.phone || '').replace(/\D/g, '');
  const whatsappLink = phoneDigits
    ? `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}`)}`
    : '#';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-lg overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="font-medium text-sm truncate">{product.name}</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative aspect-square bg-gray-100">
          {product.photos?.[photoIndex] ? (
            <Image
              src={getImageUrl(product.photos[photoIndex])}
              alt={product.name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Package className="h-16 w-16" />
            </div>
          )}
        </div>
        <div className="p-4 space-y-2 overflow-y-auto">
          {product.description && (
            <p className="text-sm text-gray-700">{product.description}</p>
          )}
          <div className="flex items-baseline gap-2">
            {product.isOnPromotion && product.promotionPrice ? (
              <>
                <span className="text-2xl font-bold" style={{ color: 'var(--sf-accent)' }}>
                  R$ {Number(product.promotionPrice).toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  R$ {Number(product.originalPrice || product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold" style={{ color: 'var(--sf-text)' }}>
                R$ {Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
          {product.size && (
            <p className="text-xs text-gray-500">Tamanho: {product.size}</p>
          )}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium"
            style={{
              backgroundColor: 'var(--sf-primary)',
              color: '#fff',
            }}
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
