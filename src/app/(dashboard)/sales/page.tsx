'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Barcode, FileText } from 'lucide-react';
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

export default function SalesPage() {
  const { api, user } = useAuth();
  const [search, setSearch] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const { addItem, items } = useCartStore();
  const [lastScanned, setLastScanned] = useState(0);
  
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
      const response = (await api.get('/product', { params: { search } })).data;
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
      console.error('Product not found');
      toast.error('Produto não encontrado');
      setScanSuccess(false);
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
    setCheckoutOpen(true);
  };

  const handleBudget = () => {
    if (items.length === 0) return;
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
    <div className="flex h-[calc(100vh-8rem)] gap-4 relative">
      {/* Products Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Vendas</h1>
          <div className="flex gap-2">
            <InputWithIcon
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              iconPosition="left"
              className="flex-1"
            />
            <Button onClick={() => setScannerOpen(true)}>
              <Barcode className="mr-2 h-4 w-4" />
              Escanear
            </Button>
          </div>
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
      <div className="w-96 flex flex-col">
        <Cart onCheckout={handleCheckout} onBudget={handleBudget} />
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
