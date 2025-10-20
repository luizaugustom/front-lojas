'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Barcode } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { handleApiError } from '@/lib/handleApiError';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart-store';
import { ProductGrid } from '@/components/sales/product-grid';
import { ProductList } from '@/components/sales/product-list';
import { Cart } from '@/components/sales/cart';
import { CheckoutDialog } from '@/components/sales/checkout-dialog';
import { BarcodeScanner } from '@/components/sales/barcode-scanner';
import { handleNumberInputChange } from '@/lib/utils';
import type { Product } from '@/types';

export default function SalesPage() {
  const { api, user } = useAuth();
  const [search, setSearch] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { addItem, items } = useCartStore();
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const [lastScanned, setLastScanned] = useState(0);

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
      }
    } catch (error) {
      console.error('Product not found');
      toast.error('Produto não encontrado');
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

  // Keyboard barcode scanner support: collect numeric input and submit on Enter
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

    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      // Ignore when typing in inputs/textareas/selects so user typing isn't captured
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
        return;
      }

      // Only accept printable characters and Enter
      if (e.key === 'Enter') {
        const code = barcodeBuffer.trim();
        if (code.length >= 3) {
          // Simple debounce: ignore if scanned too recently
          const now = Date.now();
          if (now - lastScanned > 500) {
            console.log('[Barcode Scanner] Código escaneado:', code);
            handleBarcodeScanned(code);
            setLastScanned(now);
          }
        }
        setBarcodeBuffer('');
      } else if (e.key.length === 1) {
        // append typical barcode characters (digits and letters)
        setBarcodeBuffer((s) => {
          const newBuffer = s + e.key;
          // Limit buffer size to prevent memory issues
          return newBuffer.length > 50 ? newBuffer.slice(-50) : newBuffer;
        });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [barcodeBuffer, lastScanned]);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setCheckoutOpen(true);
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
      {/* Barcode Scanner Indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-2">
          <span>📱</span>
          <span>Scanner Ativo</span>
          {barcodeBuffer && (
            <span className="bg-primary-foreground/20 px-2 py-0.5 rounded text-xs">
              {barcodeBuffer.length} chars
            </span>
          )}
        </div>
      </div>
      
      {/* Products Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Vendas</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
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
        <Cart onCheckout={handleCheckout} />
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
