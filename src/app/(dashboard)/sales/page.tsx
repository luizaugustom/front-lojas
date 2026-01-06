'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input, InputWithIcon } from '@/components/ui/input';
import { handleApiError } from '@/lib/handleApiError';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart-store';
import { ProductGrid } from '@/components/sales/product-grid';
import { ProductList } from '@/components/sales/product-list';
import { Cart } from '@/components/sales/cart';
import { CheckoutDialog } from '@/components/sales/checkout-dialog';
import { BudgetDialog } from '@/components/sales/budget-dialog';
import { BarcodeScanner } from '@/components/sales/barcode-scanner';
import { handleNumberInputChange, isValidId } from '@/lib/utils-clean';
import { useDeviceStore } from '@/store/device-store';
import type { Product } from '@/types';
import { parseScaleBarcode } from '@/lib/scale-barcode';
import { useUIStore } from '@/store/ui-store';

const isValidHex = (hex: string | null | undefined) => {
  if (!hex) return false;
  return /^#?[0-9A-Fa-f]{6}$/.test(hex);
};

const normalizeHex = (hex: string | null | undefined, fallback = '#6366F1') => {
  if (!isValidHex(hex)) return fallback;
  return hex!.startsWith('#') ? hex! : `#${hex}`;
};

const adjustHexBrightness = (hex: string, amount: number) => {
  const normalized = normalizeHex(hex);
  const cleanHex = normalized.replace('#', '');

  const clamp = (value: number) => Math.max(0, Math.min(255, value));
  const channels = [
    clamp(parseInt(cleanHex.substring(0, 2), 16) + amount),
    clamp(parseInt(cleanHex.substring(2, 4), 16) + amount),
    clamp(parseInt(cleanHex.substring(4, 6), 16) + amount),
  ];

  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${channels.map(toHex).join('')}`;
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = normalizeHex(hex);
  const cleanHex = normalized.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function SalesPage() {
  const { api, user } = useAuth();
  const [search, setSearch] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const { addItem, items } = useCartStore();
  const [lastScanned, setLastScanned] = useState(0);
  const companyColor = useUIStore((state) => state.companyColor);
  const brandColor = useMemo(() => normalizeHex(companyColor), [companyColor]);
  const gradientStart = useMemo(() => brandColor, [brandColor]);
  const gradientEnd = useMemo(() => adjustHexBrightness(brandColor, 40), [brandColor]);
  const buttonShadow = useMemo(() => hexToRgba(brandColor, 0.45), [brandColor]);
  const buttonOutline = useMemo(() => hexToRgba(brandColor, 0.2), [brandColor]);
  const badgeTextColor = useMemo(() => adjustHexBrightness(brandColor, -30), [brandColor]);
  const badgeShadow = useMemo(() => hexToRgba(brandColor, 0.35), [brandColor]);
  const headerBorder = useMemo(() => hexToRgba(brandColor, 0.2), [brandColor]);
  const headerShadow = useMemo(() => hexToRgba(brandColor, 0.45), [brandColor]);
  const headerIconBg = useMemo(() => hexToRgba(brandColor, 0.25), [brandColor]);
  
  // Device status from store
  const { 
    barcodeBuffer, 
    setBarcodeBuffer, 
    scanSuccess, 
    setScanSuccess,
    setPrinterStatus,
    setPrinterName,
    setScannerActive
  } = useDeviceStore();

  // Abrir caixa: estado e lógica
  const [openingDialogOpen, setOpeningDialogOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [creatingClosure, setCreatingClosure] = useState(false);

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const params: any = { 
        search, 
        page: 1, 
        limit: search ? 1000 : 10 // Se tem busca, mostra todos; se não, só 10 mais vendidos
      };
      const response = (await api.get('/product', { params })).data;
      return response;
    },
  });

  const products = productsResponse?.products || [];

  const handleBarcodeScanned = async (barcode: string) => {
    setScanSuccess(true);
    setTimeout(() => setScanSuccess(false), 1500);
    
    try {
      const product = (await api.get(`/product/barcode/${barcode}`)).data;
      // Manter ID original do produto
      console.log('[DEBUG] Produto encontrado por código de barras:', {
        productId: product.id,
        productName: product.name,
        isUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id)
      });
      
      try {
        addItem(product, 1);
        toast.success(`${product.name} adicionado ao carrinho!`);
        setScannerOpen(false);
      } catch (addError) {
        console.error('[DEBUG] Erro ao adicionar produto escaneado ao carrinho:', addError);
        toast.error(addError instanceof Error ? addError.message : 'Erro ao adicionar produto ao carrinho');
        setScanSuccess(false);
      }
    } catch (error) {
      // Tentativa 2: tratar como etiqueta de balança (EAN-13 com peso/preço)
      const parsed = parseScaleBarcode(barcode);
      if (!parsed) {
        console.error('Product not found');
        toast.error('Produto não encontrado');
        setScanSuccess(false);
        return;
      }

      try {
        // Buscar produto pelo código interno de 5 dígitos
        const prod = (await api.get(`/product/barcode/${parsed.itemCode}`)).data as Product;
        let quantity = 1;
        if (parsed.type === 'weight') {
          quantity = parsed.amount; // kg
        } else {
          // tipo preço: calcular quantidade = totalEtiqueta / preçoUnitário
          const unitPrice = Number(prod.price);
          if (unitPrice > 0) {
            quantity = Math.max(0.001, Number((parsed.amount / unitPrice).toFixed(3)));
          }
        }

        addItem(prod, quantity);
        const label = parsed.type === 'weight' ? `${quantity.toFixed(3)} kg` : `R$ ${parsed.amount.toFixed(2)}`;
        toast.success(`${prod.name} adicionado (${label})!`);
        setScannerOpen(false);
      } catch (e2) {
        console.error('[Scale Barcode] Produto não encontrado pelo código interno:', parsed.itemCode, e2);
        toast.error('Produto da etiqueta de balança não encontrado');
        setScanSuccess(false);
      }
    }
  };

  // Clear barcode buffer after inactivity
  useEffect(() => {
    if (barcodeBuffer) {
      const timer = setTimeout(() => {
        setBarcodeBuffer('');
      }, 3000); // Clear after 3 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [barcodeBuffer]);

  // Verificar status da impressora apenas ao montar o componente (não periodicamente)
  useEffect(() => {
    const checkPrinterStatus = async () => {
      try {
        // Buscar impressoras cadastradas
        const response = await api.get('/printer');
        const printers = response.data?.printers || response.data || [];
        
        // Encontrar impressora padrão
        const printer = printers.find((p: any) => p.isDefault) || printers[0];
        
        if (!printer) {
          setPrinterStatus('disconnected');
          setPrinterName(null);
          return;
        }

        setPrinterName(printer.name);

        // Verificar status da impressora
        try {
          const statusResponse = await api.get(`/printer/${printer.id}/status`);
          const status = statusResponse.data;
          
          if (status.connected || status.status === 'online' || status.status === 'ready') {
            setPrinterStatus('connected');
          } else {
            setPrinterStatus('error');
          }
        } catch (statusError) {
          setPrinterStatus('error');
        }
      } catch (error) {
        // Se não houver impressoras cadastradas
        setPrinterStatus('disconnected');
        setPrinterName(null);
      }
    };

    // Verificar apenas uma vez ao montar
    checkPrinterStatus();
  }, [api, setPrinterStatus, setPrinterName]);

  // Keyboard barcode scanner support: collect input globally and submit on Enter
  useEffect(() => {
    // Ao montar, verificar se existe fechamento de caixa atual. Se não, pedir saldo inicial.
    (async () => {
      try {
        // Só faz sentido para usuários que podem abrir caixa (empresa/admin/vendedor)
        if (!user) return;

        const resp = await api.get('/cash-closure/current');
        const current = resp?.data;
        // Se não houver um current válido, abrir diálogo
        if (!current || !current.id) {
          setOpeningDialogOpen(true);
        }
      } catch (err: any) {
        // Se API retornar 404 ou similar, entendemos que não existe caixa aberto
        const status = err?.response?.status;
        if (status === 404 || status === 204) {
          setOpeningDialogOpen(true);
        } else {
          // Erro inesperado: log e continua (não bloquear UX)
          console.error('Erro ao checar cash-closure/current', err);
        }
      }
    })();

    // Ativar status do leitor enquanto a página estiver montada
    setScannerActive(true);

    // Temporizador para medir velocidade de digitação (detectar leitor vs digitação humana)
    const scanStartedAtRef = { current: null as number | null };

    const onKey = (e: KeyboardEvent) => {
      // Verificar se e.key existe
      if (!e.key) return;

      // Aceitar caracteres imprimíveis e Enter, mesmo com foco em inputs (sempre ativo)
      if (e.key === 'Enter') {
        const code = barcodeBuffer.trim();
        if (code.length >= 3) {
          // Heurística: considerar leitor se velocidade média < 80ms por caractere
          const startedAt = (scanStartedAtRef.current ?? Date.now());
          const duration = Date.now() - startedAt;
          const avgPerChar = duration / Math.max(1, code.length);
          const isLikelyScanner = avgPerChar < 80;

          // Simple debounce: ignore if scanned too recently
          const now = Date.now();
          if (isLikelyScanner && now - lastScanned > 500) {
            console.log('[Barcode Scanner] Código escaneado:', code, { avgPerCharMs: Math.round(avgPerChar) });
            handleBarcodeScanned(code);
            setLastScanned(now);
          }
        }
        setBarcodeBuffer('');
        scanStartedAtRef.current = null;
      } else if (e.key.length === 1) {
        // Acumular caracteres típicos de leitores (rápidos e sequenciais)
        if (!barcodeBuffer) {
          // Primeiro caractere da sequência
          scanStartedAtRef.current = Date.now();
        }
        setBarcodeBuffer((s) => {
          const newBuffer = s + e.key;
          // Limit buffer size to prevent memory issues
          return newBuffer.length > 50 ? newBuffer.slice(-50) : newBuffer;
        });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      setScannerActive(false);
    };
  }, [barcodeBuffer, lastScanned, setScannerActive, setBarcodeBuffer]);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setMobileCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleBudget = () => {
    if (items.length === 0) return;
    setMobileCartOpen(false);
    setBudgetOpen(true);
  };

  const handleBudgetSuccess = () => {
    // Carrinho será mantido ou limpo conforme a necessidade do usuário
    toast.success('Orçamento criado com sucesso!');
  };

  const submitOpening = async () => {
    const value = Number(openingBalance.replace(',', '.'));
    if (isNaN(value) || value < 0) {
      toast.error('Digite um valor inicial válido (>= 0)');
      return;
    }
    try {
      setCreatingClosure(true);
      await api.post('/cash-closure', { openingAmount: value });
      toast.success('Caixa aberto com saldo inicial registrado');
      setOpeningDialogOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setCreatingClosure(false);
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row h-full md:h-[calc(100vh-8rem)] gap-4">
      {/* Products Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Vendas</h1>
          <InputWithIcon
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            iconPosition="left"
            className="flex-1"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <ProductList
            products={products || []}
            isLoading={isLoading}
            onAddToCart={(product) => {
              // Manter ID original do produto no carrinho
              console.log('[DEBUG] Adicionando produto ao carrinho:', {
                productId: product.id,
                productName: product.name,
                isUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id)
              });
              
              try {
                addItem(product);
              } catch (error) {
                console.error('[DEBUG] Erro ao adicionar produto ao carrinho:', error);
                toast.error(error instanceof Error ? error.message : 'Erro ao adicionar produto ao carrinho');
              }
            }}
          />
        </div>
      </div>

      {/* Cart Section */}
      <div className="hidden md:flex w-96 flex-col">
        <Cart onCheckout={handleCheckout} onBudget={handleBudget} />
      </div>

      {/* Floating Cart Button - Mobile */}
      <div className="pointer-events-none md:hidden fixed bottom-6 right-4 left-4 z-40 flex justify-end">
        <div className="pointer-events-auto relative">
          {!mobileCartOpen && (
            <div
              className="absolute -top-10 right-1/2 translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-medium text-white"
              style={{
                background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
              }}
            >
              Carrinho ({items.length})
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            aria-label="Abrir carrinho"
            aria-expanded={mobileCartOpen}
            className="group flex items-center gap-2 rounded-full px-5 py-3 text-white transition-all focus:outline-none"
            style={{
              background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
            }}
          >
            <div
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105"
              style={{
                backgroundColor: hexToRgba('#ffffff', 0.18),
              }}
            >
              <ShoppingCart className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              {items.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white text-xs font-semibold"
                  style={{
                    color: badgeTextColor,
                  }}
                >
                  {items.length}
                </span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold">Ver carrinho</span>
              <span className="text-[11px] uppercase tracking-wide text-white/70">toque para abrir</span>
            </div>
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={handleBarcodeScanned}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

      <BudgetDialog
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        onSuccess={handleBudgetSuccess}
      />

      {/* Mobile Cart Dialog */}
      <Dialog open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
        <DialogContent className="md:hidden top-auto bottom-6 left-1/2 translate-y-0 translate-x-[-50%] w-[min(100vw-2rem,420px)] max-h-[85vh] border-0 bg-transparent p-0 shadow-none">
            <div
              className="relative overflow-hidden rounded-3xl border bg-background/95 backdrop-blur-xl"
              style={{
                borderColor: headerBorder,
              }}
            >
            <div
              className="flex items-center gap-3 border-b border-white/5 px-4 py-3 text-white"
              style={{
                background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
              }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{
                  backgroundColor: headerIconBg,
                }}
              >
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Seu carrinho</span>
                <span className="text-xs text-white/80">
                  {items.length} {items.length === 1 ? 'produto' : 'produtos'}
                </span>
              </div>
            </div>
            <div className="px-3 pb-4 pt-3">
              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <Cart onCheckout={handleCheckout} onBudget={handleBudget} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para abertura de caixa (aparece se não houver caixa atual) */}
      <Dialog open={openingDialogOpen} onOpenChange={setOpeningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caixa</DialogTitle>
            <DialogDescription>Informe o valor inicial do caixa para iniciar as vendas do dia.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="openingBalance">Saldo inicial</Label>
              <Input 
                id="openingBalance" 
                type="text"
                placeholder="0.00" 
                value={openingBalance} 
                onChange={(e) => handleNumberInputChange(e, setOpeningBalance)}
                onBlur={() => {
                  if (openingBalance === '') {
                    setOpeningBalance('0');
                  }
                }}
                className="no-spinner"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpeningDialogOpen(false)} disabled={creatingClosure}>Cancelar</Button>
            <Button onClick={submitOpening} disabled={creatingClosure}>
              {creatingClosure ? 'Abrindo...' : 'Abrir Caixa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
