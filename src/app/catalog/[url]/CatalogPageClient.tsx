'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Phone, Package, Search, ChevronDown, MessageCircle, X, Plus, Minus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';
import { getRandomVerse } from '@/lib/verses';

interface Product {
  id: string;
  name: string;
  photos: string[];
  price: string;
  stockQuantity: number;
  size: string | null;
  category: string | null;
  description?: string | null;
  unitOfMeasure?: string;
  originalPrice?: string;
  promotionPrice?: string;
  promotionDiscount?: number;
  isOnPromotion?: boolean;
  promotionName?: string;
}

interface CatalogData {
  company: {
    id: string;
    name: string;
    fantasyName?: string | null;
    phone: string | null;
    email: string | null;
    logoUrl: string | null;
    brandColor: string | null;
    address: string;
  };
  products: Product[];
  promotedProducts?: Product[];
}

export default function CatalogPageClient() {
  const params = useParams();
  const url = params.url as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalPhotoIndex, setProductModalPhotoIndex] = useState(0);
  const [verse, setVerse] = useState<{ reference: string; text: string } | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const initialProductFromUrlApplied = useRef(false);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        let baseUrl =
          process.env.NEXT_PUBLIC_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          'https://montshop-api-qi3v4.ondigitalocean.app';

        // Remover barra final se existir para evitar barras duplicadas
        baseUrl = baseUrl.replace(/\/+$/, '');
        
        const catalogUrl = `${baseUrl}/public/catalog/${url}/products`;
        console.log('🔍 Buscando catálogo na URL:', catalogUrl);
        
        const response = await fetch(catalogUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro na resposta:', errorText);
          
          // Verificar se é erro de plano
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) {
              if (errorData.message.includes('plano PRO')) {
                throw new Error('O catálogo público está disponível apenas para empresas com plano PRO');
              }

              if (errorData.message.includes('não encontrada') || errorData.message.includes('não está habilitada')) {
                throw new Error(errorData.message);
              }

              throw new Error(errorData.message);
            }
          } catch (e) {
            // Se não conseguir parsear, usar mensagem padrão
          }
          
          throw new Error(`Página não encontrada (Status: ${response.status})`);
        }
        
        const catalogData = await response.json();
        console.log('✅ Dados recebidos:', catalogData);
        setData(catalogData);
      } catch (err) {
        console.error('❌ Erro ao buscar catálogo:', err);
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Não foi possível conectar com o servidor. Verifique se a API está rodando.');
        } else {
          setError(err instanceof Error ? err.message : 'Erro ao carregar catálogo');
        }
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchCatalogData();
    }
  }, [url]);

  // Atualizar título da página com nome fantasia da empresa do catálogo
  useEffect(() => {
    if (data?.company) {
      const displayName = data.company.fantasyName || data.company.name;
      document.title = displayName;
    } else {
      // Manter título padrão enquanto carrega
      document.title = 'Sistema Montshop - Gestão Lojas';
    }
  }, [data?.company]);

  // Aplicar cor da empresa na scrollbar quando os dados forem carregados
  useEffect(() => {
    if (data?.company.brandColor && typeof document !== 'undefined') {
      // Usar a cor da empresa diretamente (já está em hex)
      document.documentElement.style.setProperty('--scrollbar-color', data.company.brandColor);
      // Criar versão mais escura para o hover
      const darkerColor = data.company.brandColor; // Usar a mesma cor para mais visibilidade
      document.documentElement.style.setProperty('--scrollbar-color-hover', darkerColor);
    }
  }, [data?.company.brandColor]);

  // Gera um versículo aleatório a cada montagem do componente
  useEffect(() => {
    const v = getRandomVerse();
    setVerse(v);
  }, []);

  // Fechar dropdown de categoria ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [categoryDropdownOpen]);

  // Abrir produto a partir do ID na URL ao carregar (compartilhamento)
  useEffect(() => {
    if (initialProductFromUrlApplied.current || !data?.products) return;
    const productId = searchParams.get('product');
    if (!productId) return;
    const product = data.products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setProductModalPhotoIndex(0);
      initialProductFromUrlApplied.current = true;
    }
  }, [data?.products, searchParams]);

  // Sincronizar produto selecionado com a URL (para permitir compartilhar link)
  useEffect(() => {
    if (!pathname) return;
    const next = new URLSearchParams(searchParams.toString());
    if (selectedProduct) {
      next.set('product', selectedProduct.id);
      const newUrl = `${pathname}?${next.toString()}`;
      const currentUrl = window.location.pathname + (window.location.search || '');
      if (newUrl !== currentUrl) router.replace(newUrl, { scroll: false });
    } else {
      // Só remove ?product= da URL se não estivermos esperando abrir a partir da URL (primeira carga)
      const hasProductInUrl = searchParams.get('product');
      if (!hasProductInUrl || initialProductFromUrlApplied.current) {
        next.delete('product');
        const query = next.toString();
        const newUrl = query ? `${pathname}?${query}` : pathname;
        const currentUrl = window.location.pathname + (window.location.search || '');
        if (newUrl !== currentUrl) router.replace(newUrl, { scroll: false });
      }
    }
  }, [pathname, selectedProduct, router, searchParams]);

  // Filtrar produtos por termo de busca e categoria
  const filteredProducts = data?.products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || (product.category || 'Sem categoria') === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Agrupar produtos por categoria
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'Sem categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Abrir detalhes do produto (atualiza URL para compartilhamento)
  const openProduct = (product: Product) => {
    initialProductFromUrlApplied.current = true;
    setProductModalPhotoIndex(0);
    setSelectedProduct(product);
  };

  // Obter todas as categorias únicas
  const allCategories = data?.products
    ? Array.from(new Set(data.products.map(p => p.category || 'Sem categoria')))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <Package className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Catálogo não encontrado</h1>
          <p className="text-gray-600">{error || 'Esta página não está disponível no momento.'}</p>
        </div>
      </div>
    );
  }

  const { company } = data;
  const companyDisplayName = company.fantasyName || company.name;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const decreaseItem = (productId: string) => {
    setCart(prev => prev
      .map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const increaseItem = (productId: string) => {
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const calcItemSubtotal = (item: { product: Product; quantity: number }) => {
    const price = Number.parseFloat(item.product.price || '0');
    return price * item.quantity;
  };

  const cartTotal = cart.reduce((sum, item) => sum + calcItemSubtotal(item), 0);

  const formatBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const checkoutWhatsApp = () => {
    if (!company.phone) return;
    if (cart.length === 0) return;

    const lines = [
      `Olá! Tenho interesse nos seguintes produtos da ${companyDisplayName}:`,
      '',
      ...cart.map(item => {
        // Usar preço promocional se disponível
        const unit = item.product.isOnPromotion && item.product.promotionPrice
          ? Number.parseFloat(item.product.promotionPrice)
          : Number.parseFloat(item.product.price || '0');
        const subtotal = unit * item.quantity;
        return `• ${item.product.name} (${item.quantity} x ${formatBRL(unit)}) = ${formatBRL(subtotal)}`;
      }),
      '',
      `Total: ${formatBRL(cartTotal)}`,
    ];

    const message = encodeURIComponent(lines.join('\n'));
    const phone = company.phone.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com informações da empresa */}
      <div 
        className="shadow-md"
        style={{
          backgroundColor: company.brandColor || '#ffffff',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo e Nome */}
            <div className="flex items-center gap-4">
              {company.logoUrl && (
                <Image
                  src={getImageUrl(company.logoUrl)}
                  alt={companyDisplayName}
                  width={120}
                  height={120}
                  className="rounded-lg object-contain"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {companyDisplayName}
                </h1>
              </div>
            </div>

            {/* Contato */}
            <div className="flex flex-col gap-2">
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
                >
                  <Phone className="h-5 w-5" />
                  <span>{company.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Busca e Filtro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800 pointer-events-none" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen((v) => !v)}
              className="flex items-center justify-between w-full min-w-[200px] pl-4 pr-11 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-medium shadow-md hover:shadow-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 cursor-pointer text-left"
            >
              <span>{selectedCategory === 'todas' ? 'Todas as categorias' : selectedCategory}</span>
              <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border-2 border-gray-200 bg-white shadow-xl overflow-hidden min-w-[200px]">
                <ul className="py-2 max-h-60 overflow-y-auto">
                  <li>
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory('todas'); setCategoryDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-gray-100 ${selectedCategory === 'todas' ? 'bg-primary/10 text-primary' : 'text-gray-900'}`}
                    >
                      Todas as categorias
                    </button>
                  </li>
                  {allCategories.map((category) => (
                    <li key={category}>
                      <button
                        type="button"
                        onClick={() => { setSelectedCategory(category); setCategoryDropdownOpen(false); }}
                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-gray-100 ${selectedCategory === category ? 'bg-primary/10 text-primary' : 'text-gray-900'}`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Seção de Promoções */}
        {data.promotedProducts && data.promotedProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b-2" style={{ color: '#000000', borderColor: company.brandColor || '#000000' }}>
              🔥 Promoções
            </h2>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                {data.promotedProducts.map((product) => (
                  <div
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openProduct(product)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProduct(product); } }}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all flex-shrink-0 cursor-pointer"
                    style={{ width: '140px' }}
                  >
                    {/* Imagem do produto */}
                    {product.photos && product.photos.length > 0 ? (
                      <div className="relative h-20 bg-gray-100 hover:opacity-90 transition-opacity">
                        <Image
                          src={getImageUrl(product.photos[0])}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 bg-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    {/* Informações do produto */}
                    <div className="p-2">
                      <h3 className="font-semibold text-[10px] leading-tight mb-1 line-clamp-2" style={{ color: '#000000' }}>
                        {product.name}
                      </h3>
                      <div className="mt-1">
                        {product.isOnPromotion && product.promotionPrice ? (
                          <>
                            <p className="text-xs font-bold text-red-600">
                              R$ {parseFloat(product.promotionPrice).toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-[9px] text-gray-500 line-through">
                              R$ {parseFloat(product.originalPrice || product.price).toFixed(2).replace('.', ',')}
                            </p>
                            {product.promotionDiscount && (
                              <p className="text-[9px] text-red-600 font-semibold mt-0.5">
                                -{product.promotionDiscount.toFixed(0)}% OFF
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs font-bold" style={{ color: company.brandColor || '#3b82f6' }}>
                            R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
                          </p>
                        )}
                        {product.stockQuantity > 0 ? (
                          <p className="text-[9px] text-green-600 mt-0.5">Em estoque</p>
                        ) : (
                          <p className="text-[9px] text-red-600 mt-0.5">Indisp</p>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          className="mt-1 w-full inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white hover:opacity-90 transition"
                          style={{ backgroundColor: company.brandColor || '#3b82f6' }}
                          aria-label="Adicionar ao carrinho"
                        >
                          <Plus className="h-3 w-3" /> Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {Object.keys(productsByCategory).length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">Nenhum produto disponível no momento.</p>
            <p className="text-gray-400 text-sm">Volte em breve para ver nossos produtos!</p>
          </div>
        ) : (
          Object.entries(productsByCategory).map(([category, products]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-bold mb-4 pb-2 border-b-2" style={{ color: '#000000', borderColor: company.brandColor || '#000000' }}>
                {category}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openProduct(product)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProduct(product); } }}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* Imagem do produto */}
                    {product.photos && product.photos.length > 0 ? (
                      <div className="relative h-16 bg-gray-100 hover:opacity-90 transition-opacity">
                        <Image
                          src={getImageUrl(product.photos[0])}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 bg-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    {/* Informações do produto */}
                    <div className="p-1.5">
                      <h3 className="font-semibold text-[10px] leading-tight mb-0.5 line-clamp-2" style={{ color: '#000000' }}>
                        {product.name}
                      </h3>
                      <div className="mt-1">
                        {product.isOnPromotion && product.promotionPrice ? (
                          <>
                            <p className="text-sm font-bold text-red-600">
                              R$ {parseFloat(product.promotionPrice).toFixed(2).replace('.', ',')} <span className="text-[9px] font-normal">/ {(product.unitOfMeasure || 'un')}</span>
                            </p>
                            <p className="text-[9px] text-gray-500 line-through">
                              R$ {parseFloat(product.originalPrice || product.price).toFixed(2).replace('.', ',')}
                            </p>
                            {product.promotionDiscount && (
                              <p className="text-[9px] text-red-600 font-semibold">
                                -{product.promotionDiscount.toFixed(0)}% OFF
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm font-bold" style={{ color: company.brandColor || '#3b82f6' }}>
                            R$ {parseFloat(product.price).toFixed(2).replace('.', ',')} <span className="text-[9px] font-normal">/ {(product.unitOfMeasure || 'un')}</span>
                          </p>
                        )}
                        {product.stockQuantity > 0 ? (
                          <p className="text-[9px] text-green-600">Em estoque</p>
                        ) : (
                          <p className="text-[9px] text-red-600">Indisp</p>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          className="mt-1 w-full inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white hover:opacity-90 transition"
                          style={{ backgroundColor: company.brandColor || '#3b82f6' }}
                          aria-label="Adicionar ao carrinho"
                        >
                          <Plus className="h-3 w-3" /> Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="text-white py-4 mt-12" style={{ backgroundColor: company.brandColor || '#000000' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Linha superior: logo à esquerda e versículo à direita */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Lado esquerdo - Logo Mont Tecnologia */}
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <a 
                href="https://montsoftwares.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Image
                  src="/logomont.png"
                  alt="Mont Tecnologia"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </a>
            </div>

            {/* Lado direito - Versículo bíblico */}
            <div className="text-center max-w-xs">
              {verse && (
                <div className="text-sm italic text-gray-300">
                  <p className="text-xs">"{verse.text}"</p>
                  <p className="text-[10px] mt-1 text-gray-400">{verse.reference}</p>
                </div>
              )}
            </div>
          </div>
          {/* Linha inferior: copyright centralizado na base do footer */}
          <div className="mt-3 text-center">
            <p className="text-xs">&copy; {new Date().getFullYear()} Sistema MontShop. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md hover:bg-white transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Foto em destaque */}
            <div className="relative aspect-square bg-gray-100 shrink-0">
              {selectedProduct.photos && selectedProduct.photos.length > 0 ? (
                <>
                  <Image
                    src={getImageUrl(selectedProduct.photos[productModalPhotoIndex])}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 512px) 100vw, 512px"
                  />
                  {selectedProduct.photos.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {selectedProduct.photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setProductModalPhotoIndex(i); }}
                          className={`h-2 rounded-full transition-all ${
                            i === productModalPhotoIndex
                              ? 'w-6 bg-white shadow'
                              : 'w-2 bg-white/60 hover:bg-white/80'
                          }`}
                          aria-label={`Foto ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>

            {/* Conteúdo: nome, preço, descrição, CTA */}
            <div className="flex flex-1 flex-col overflow-hidden p-5">
              {selectedProduct.category && (
                <span
                  className="mb-1 text-xs font-medium uppercase tracking-wide"
                  style={{ color: company.brandColor || '#3b82f6' }}
                >
                  {selectedProduct.category}
                </span>
              )}
              <h2 id="product-modal-title" className="text-xl font-bold text-gray-900 mb-2 pr-8">
                {selectedProduct.name}
              </h2>

              {/* Preço */}
              <div className="mb-4">
                {selectedProduct.isOnPromotion && selectedProduct.promotionPrice ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600">
                      {formatBRL(parseFloat(selectedProduct.promotionPrice))}
                    </span>
                    <span className="text-base text-gray-500 line-through">
                      {formatBRL(parseFloat(selectedProduct.originalPrice || selectedProduct.price))}
                    </span>
                    {selectedProduct.promotionDiscount != null && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-600">
                        -{selectedProduct.promotionDiscount.toFixed(0)}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span
                    className="text-2xl font-bold"
                    style={{ color: company.brandColor || '#3b82f6' }}
                  >
                    {formatBRL(parseFloat(selectedProduct.price))}
                  </span>
                )}
                <span className="ml-1 text-sm text-gray-500">
                  / {(selectedProduct.unitOfMeasure || 'un')}
                </span>
              </div>

              {/* Descrição */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-4">
                {selectedProduct.description && selectedProduct.description.trim() ? (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedProduct.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sem descrição.</p>
                )}
              </div>

              {/* Estoque + Adicionar ao carrinho */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                {selectedProduct.stockQuantity > 0 ? (
                  <span className="text-sm text-green-600 font-medium">Em estoque</span>
                ) : (
                  <span className="text-sm text-red-600 font-medium">Indisponível</span>
                )}
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setCartOpen(true);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.stockQuantity <= 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-base font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ backgroundColor: company.brandColor || '#3b82f6' }}
                >
                  <Plus className="h-5 w-5" /> Adicionar ao carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão WhatsApp Fixo */}
      {company.phone && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Botão abrir carrinho */}
          <button
            onClick={() => setCartOpen(v => !v)}
            className="mb-3 group relative flex items-center justify-center w-14 h-14 bg-primary hover:opacity-90 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            title="Abrir carrinho"
          >
            <ShoppingCart className="h-7 w-7 text-white" />
          </button>

          {/* Botão WhatsApp direto (contato) - mantém opção original */}
          <a
            href={`https://wa.me/${company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre os produtos da ${companyDisplayName}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            title="Fale conosco no WhatsApp"
          >
            <svg className="h-7 w-7 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      )}

      {/* Carrinho Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ${cartOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-white rounded-t-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-900">
                <ShoppingCart className="h-5 w-5 text-gray-900" strokeWidth={2} />
                <h3 className="font-semibold text-gray-900">Carrinho ({cart.reduce((s, i) => s + i.quantity, 0)} itens)</h3>
              </div>
              <button className="text-sm text-gray-700 hover:text-gray-900 font-medium" onClick={() => setCartOpen(false)}>Fechar</button>
            </div>

            {cart.length === 0 ? (
              <div className="px-4 py-8 text-center text-black">Seu carrinho está vazio.</div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y">
                {cart.map(item => (
                  <div key={item.product.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-black">{item.product.name}</p>
                      <p className="text-xs text-black">{formatBRL(Number.parseFloat(item.product.price || '0'))}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => decreaseItem(item.product.id)} className="p-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-900" aria-label="Diminuir">
                        <Minus className="h-3 w-3 text-gray-900" strokeWidth={2.5} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                      <button onClick={() => increaseItem(item.product.id)} className="p-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-900" aria-label="Aumentar">
                        <Plus className="h-3 w-3 text-gray-900" strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="w-24 text-right text-sm font-semibold text-black">{formatBRL(calcItemSubtotal(item))}</div>
                    <button onClick={() => removeItem(item.product.id)} className="ml-2 text-xs text-red-600 hover:underline">Remover</button>
                  </div>
                ))}
              </div>
            )}

            <div className="px-4 py-3 border-t bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-black">Total</span>
                <span className="text-lg font-bold text-black">{formatBRL(cartTotal)}</span>
              </div>
              <button
                disabled={!company.phone || cart.length === 0}
                onClick={checkoutWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-5 w-5" /> Finalizar pelo WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

