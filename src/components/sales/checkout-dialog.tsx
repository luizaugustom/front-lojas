'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleApiError } from '@/lib/handleApiError';
import { saleApi, sellerApi } from '@/lib/api-endpoints';
import { saleSchema } from '@/lib/validations';
import { generateCoherentUUID, ensureCoherentId, formatCurrency, calculateChange, calculateMultiplePaymentChange, handleNumberInputChange, convertCuidToUuid, testUuidConversion, testSaleUuidConversion } from '@/lib/utils';
import { apiCallWithIdConversion } from '@/lib/apiClient';
import { useCartStore } from '@/store/cart-store';
import { InstallmentSaleModal } from './installment-sale-modal';
import { useAuth } from '@/hooks/useAuth';
import type { CreateSaleDto, PaymentMethod, PaymentMethodDetail, InstallmentData, Seller } from '@/types';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'installment', label: 'A prazo' },
];

export function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentMethodDetail[]>([]);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [installmentData, setInstallmentData] = useState<InstallmentData | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [loadingSellers, setLoadingSellers] = useState(false);
  const { items, discount, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();

  const total = getTotal();
  const isCompany = user?.role === 'empresa';


  // Carregar vendedores quando o modal abrir e o usuário for empresa
  useEffect(() => {
    if (open && isCompany) {
      loadSellers();
    }
  }, [open, isCompany]);

  // Resetar estado quando o modal fechar
  useEffect(() => {
    if (!open) {
      setPaymentDetails([]);
      setShowInstallmentModal(false);
      setInstallmentData(null);
      setSelectedCustomerId('');
      setSelectedSellerId('');
    }
  }, [open]);

  const loadSellers = async () => {
    if (!isCompany) return;
    
    setLoadingSellers(true);
    try {
      const response = await sellerApi.list({ 
        companyId: user?.companyId 
      });
      
      // Normalizar a resposta da API (mesma lógica da página de vendedores)
      const sellersData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data 
        ? response.data.data 
        : response.data?.sellers 
        ? response.data.sellers 
        : response.data 
        ? [response.data] 
        : [];
      
      // Normalizar IDs dos vendedores para UUIDs válidos
      const normalizedSellers = sellersData.map((seller: Seller) => {
        console.log('[DEBUG] Vendedor sendo normalizado:', {
          originalId: seller.id,
          sellerName: seller.name,
          isOriginalUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(seller.id)
        });
        
        const normalizedSeller = {
          ...seller,
          id: convertCuidToUuid(seller.id)
        };
        
        console.log('[DEBUG] Vendedor normalizado:', {
          normalizedId: normalizedSeller.id,
          isNormalizedUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedSeller.id)
        });
        
        return normalizedSeller;
      });
      
      setSellers(normalizedSellers);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      toast.error('Erro ao carregar lista de vendedores');
      setSellers([]);
    } finally {
      setLoadingSellers(false);
    }
  };


  const addPaymentMethod = () => {
    setPaymentDetails([...paymentDetails, { method: 'cash', amount: 0 }]);
  };

  const removePaymentMethod = (index: number) => {
    setPaymentDetails(paymentDetails.filter((_, i) => i !== index));
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentMethodDetail, value: PaymentMethod | number) => {
    const updated = [...paymentDetails];
    updated[index] = { ...updated[index], [field]: value };
    setPaymentDetails(updated);
  };

  const getTotalPaid = () => {
    return paymentDetails.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getRemainingAmount = () => {
    return total - getTotalPaid();
  };

  const getCashChange = () => {
    const cashPayment = paymentDetails.find(p => p.method === 'cash');
    if (!cashPayment) return 0;
    return Math.max(0, cashPayment.amount - total);
  };

  const getPaymentSummary = () => {
    return calculateMultiplePaymentChange(paymentDetails, total);
  };

  const hasInstallmentPayment = () => {
    return paymentDetails.some(payment => payment.method === 'installment');
  };

  const handleInstallmentConfirm = (customerId: string, data: InstallmentData) => {
    setSelectedCustomerId(customerId);
    setInstallmentData(data);
    setShowInstallmentModal(false);
    
    // Adicionar método de pagamento a prazo automaticamente
    const installmentPayment: PaymentMethodDetail = {
      method: 'installment',
      amount: total,
    };
    
    // Se já existe um método de pagamento a prazo, substituir
    const existingInstallmentIndex = paymentDetails.findIndex(p => p.method === 'installment');
    if (existingInstallmentIndex >= 0) {
      const updated = [...paymentDetails];
      updated[existingInstallmentIndex] = installmentPayment;
      setPaymentDetails(updated);
    } else {
      setPaymentDetails([...paymentDetails, installmentPayment]);
    }
    
    toast.success(`Venda a prazo configurada para ${data.installments}x de ${formatCurrency(data.installmentValue)}`);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ clientName?: string; clientCpfCnpj?: string }>({});

  const onSubmit = async (data: { clientName?: string; clientCpfCnpj?: string }) => {
    // Teste da conversão UUID para vendas
    console.log('[DEBUG] Testando conversão UUID para vendas:');
    testSaleUuidConversion();
    
    // Debug detalhado dos IDs dos produtos no carrinho
    console.log('[DEBUG] Itens do carrinho antes do envio:');
    items.forEach((item, index) => {
      console.log(`[DEBUG] Item ${index}:`, {
        productId: item.product.id,
        productName: item.product.name,
        isUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.product.id),
        isCuid: /^[a-z0-9]{25}$/i.test(item.product.id),
        convertedUuid: convertCuidToUuid(item.product.id)
      });
    });
    
    if (paymentDetails.length === 0) {
      toast.error('Adicione pelo menos um método de pagamento!');
      return;
    }

    // Validar se empresa selecionou vendedor
    if (isCompany && !selectedSellerId) {
      toast.error('Selecione um vendedor para realizar a venda!');
      return;
    }

    const totalPaid = getTotalPaid();
    const remainingAmount = getRemainingAmount();

    // Validar se o valor pago é suficiente (pode ser maior devido ao troco)
    if (remainingAmount > 0.01) {
      toast.error(`Valor total dos pagamentos (${formatCurrency(totalPaid)}) deve ser pelo menos igual ao total da venda (${formatCurrency(total)})!`);
      return;
    }


    setLoading(true);
    try {
      // Analisar IDs dos produtos para determinar estratégia
      const productIds = items.map(item => item.product.id);
      const hasUuids = productIds.some(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id));
      const hasCuids = productIds.some(id => /^[a-z0-9]{25}$/i.test(id));
      
      console.log('[DEBUG] Análise de IDs dos produtos:', {
        totalItems: items.length,
        hasUuids,
        hasCuids,
        productIds: productIds.map((id, index) => ({
          index,
          id,
          isUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id),
          isCuid: /^[a-z0-9]{25}$/i.test(id)
        }))
      });

      // Dados da venda - CONVERTER TODOS OS IDs PARA UUIDs
      // O backend agora exige UUIDs mesmo para operações de criação (POST)
      const saleData: CreateSaleDto = {
        items: items.map((item) => {
          console.log('[DEBUG] Item do carrinho:', {
            productId: item.product.id,
            productName: item.product.name,
            isUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.product.id),
            isCuid: /^[a-z0-9]{25}$/i.test(item.product.id),
            quantity: item.quantity
          });
          
          // Validar se o produto tem um ID válido antes de converter
          if (!item.product.id || item.product.id.trim() === '') {
            throw new Error(`Produto "${item.product.name}" não possui ID válido. Remova este item do carrinho e adicione novamente.`);
          }
          
          // Verificar se é o UUID problemático reportado
          if (item.product.id.includes('00000000-0000-4000-8000-000063ef2970')) {
            throw new Error(`Produto "${item.product.name}" possui ID corrompido. Remova este item do carrinho e adicione novamente.`);
          }
          
          try {
            // CONVERTER SEMPRE PARA UUID - backend exige UUIDs
            const coherentProductId = ensureCoherentId(item.product.id, 'sale.productId');
            console.log(`[DEBUG] Convertendo productId: ${item.product.id} -> ${coherentProductId}`);
            
            return {
              productId: coherentProductId, // Converter para UUID
              quantity: item.quantity,
            };
          } catch (error) {
            console.error(`[DEBUG] Erro ao converter productId: ${item.product.id}`, error);
            throw new Error(`Erro ao processar produto "${item.product.name}": ${error instanceof Error ? error.message : 'ID inválido'}. Remova este item do carrinho e adicione novamente.`);
          }
        }),
        paymentMethods: paymentDetails.map((payment) => {
          const paymentMethod: any = {
            method: payment.method,
            amount: payment.amount,
          };
          
          // Adicionar additionalInfo para vendas a prazo
          if (payment.method === 'installment' && installmentData) {
            paymentMethod.additionalInfo = `Parcelado em ${installmentData.installments}x de ${formatCurrency(installmentData.installmentValue)}`;
          }
          
          return paymentMethod;
        }),
        clientName: data.clientName,
        clientCpfCnpj: data.clientCpfCnpj,
        sellerId: selectedSellerId ? ensureCoherentId(selectedSellerId, 'sale.sellerId') : undefined, // Converter para UUID
      };
      
      console.log('[DEBUG] SellerId sendo enviado:', {
        originalSellerId: selectedSellerId,
        convertedSellerId: selectedSellerId ? ensureCoherentId(selectedSellerId, 'sale.sellerId') : undefined,
        isUuid: selectedSellerId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(selectedSellerId) : 'undefined'
      });
      
      console.log('[Checkout] Sale data:', saleData);

      // Criar venda com IDs convertidos para UUIDs
      // O backend agora exige UUIDs mesmo para operações de criação (POST)
      await saleApi.create(saleData);
      toast.success('Venda realizada com sucesso!');
      clearCart();
      reset();
      setPaymentDetails([]);
      setInstallmentData(null);
      setSelectedCustomerId('');
      onClose();
    } catch (error) {
      console.error('[Checkout] Error details:', error);
      console.error('[Checkout] Error type:', typeof error);
      console.error('[Checkout] Error message:', error instanceof Error ? error.message : 'Unknown error');
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
          <DialogDescription>Complete as informações da venda</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do Cliente (Opcional)</Label>
            <Input id="clientName" {...register('clientName')} disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientCpfCnpj">CPF/CNPJ do Cliente (Opcional)</Label>
            <Input
              id="clientCpfCnpj"
              placeholder="000.000.000-00"
              {...register('clientCpfCnpj')}
              disabled={loading}
            />
          </div>

          {isCompany && (
            <div className="space-y-2">
              <Label htmlFor="seller">Vendedor *</Label>
              <Select
                value={selectedSellerId}
                onValueChange={setSelectedSellerId}
                disabled={loading || loadingSellers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingSellers ? "Carregando vendedores..." : "Selecione um vendedor"} />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name} {seller.login && `(${seller.login})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sellers.length === 0 && !loadingSellers && (
                <p className="text-sm text-muted-foreground">
                  Nenhum vendedor cadastrado. Cadastre vendedores na seção de Vendedores.
                </p>
              )}
            </div>
          )}


          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Métodos de Pagamento</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPaymentMethod}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {paymentDetails.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum método de pagamento adicionado</p>
                <p className="text-sm">Clique em "Adicionar" para incluir um método de pagamento</p>
              </div>
            )}

            {paymentDetails.map((payment, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <div className="flex-1">
                  <Select
                    value={payment.method}
                    onValueChange={(value: PaymentMethod) => {
                      if (value === 'installment') {
                        setShowInstallmentModal(true);
                      } else {
                        updatePaymentMethod(index, 'method', value);
                      }
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="0,00"
                    value={payment.amount > 0 ? payment.amount.toString().replace('.', ',') : ''}
                    onChange={(e) => handleNumberInputChange(e, (value) => {
                      updatePaymentMethod(index, 'amount', Number(value) || 0);
                    })}
                    disabled={loading}
                    className="no-spinner"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePaymentMethod(index)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between">
              <span>Total da Venda:</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Pago:</span>
              <span className="font-bold">{formatCurrency(getTotalPaid())}</span>
            </div>
            {getCashChange() > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Troco:</span>
                <span className="font-bold">{formatCurrency(getCashChange())}</span>
              </div>
            )}
            {installmentData && (
              <div className="flex justify-between text-blue-600">
                <span>Parcelas:</span>
                <span className="font-bold">{installmentData.installments}x de {formatCurrency(installmentData.installmentValue)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Restante:</span>
              <span className={getRemainingAmount() > 0 ? 'text-red-600' : 'text-green-600'}>
                {formatCurrency(getRemainingAmount())}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || paymentDetails.length === 0}>
              {loading ? 'Processando...' : 'Confirmar Venda'}
            </Button>
          </DialogFooter>
        </form>

        {/* Modal de Vendas a Prazo */}
        <InstallmentSaleModal
          open={showInstallmentModal}
          onClose={() => setShowInstallmentModal(false)}
          onConfirm={handleInstallmentConfirm}
          totalAmount={total}
        />
      </DialogContent>
    </Dialog>
  );
}