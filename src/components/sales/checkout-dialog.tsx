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
import { formatCurrency, calculateChange, calculateMultiplePaymentChange, handleNumberInputChange, isValidId, validateUUID } from '@/lib/utils-clean';
import { useCartStore } from '@/store/cart-store';
import { InstallmentSaleModal } from './installment-sale-modal';
import { PrintConfirmationDialog } from './print-confirmation-dialog';
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
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [selectedCustomerCpfCnpj, setSelectedCustomerCpfCnpj] = useState<string>('');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [showPrintConfirmation, setShowPrintConfirmation] = useState(false);
  const [createdSaleId, setCreatedSaleId] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const { items, discount, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated, api } = useAuth();

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
      setShowPrintConfirmation(false);
      setCreatedSaleId(null);
      setPrinting(false);
    }
  }, [open]);

  const loadSellers = async () => {
    if (!isCompany) return;
    
    setLoadingSellers(true);
    try {
      const response = await sellerApi.list({ 
        companyId: (user?.companyId ?? undefined) 
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
      
      // Validar que os vendedores têm IDs válidos (UUID v4 ou CUID)
      const validSellers = sellersData.filter((seller: Seller) => {
        const isValid = isValidId(seller.id);
        
        if (!isValid) {
          console.error('[Checkout] Vendedor com ID inválido ignorado:', {
            sellerId: seller.id,
            sellerName: seller.name
          });
        }
        return isValid;
      });
      
      if (validSellers.length === 0 && sellersData.length > 0) {
        console.error('[Checkout] ERRO: Todos os vendedores têm IDs inválidos!');
        toast.error('Erro: vendedores com IDs inválidos. Contate o suporte.');
      }
      
      setSellers(validSellers);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      toast.error('Erro ao carregar lista de vendedores');
      setSellers([]);
    } finally {
      setLoadingSellers(false);
    }
  };


  const addPaymentMethod = () => {
    // Prefill with remaining amount to avoid zero-value payments
    const remaining = getRemainingAmount();
    const defaultAmount = remaining > 0 ? remaining : 0;
    setPaymentDetails([...paymentDetails, { method: 'cash', amount: defaultAmount }]);
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
    return paymentDetails.reduce((sum, payment) => sum + Number(payment.amount), 0);
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

  const handleInstallmentConfirm = (customerId: string, data: InstallmentData, customerInfo?: { name: string; cpfCnpj?: string }) => {
    setSelectedCustomerId(customerId);
    setInstallmentData(data);
    setShowInstallmentModal(false);
    // Autopreencher dados do cliente no formulário principal
    if (customerInfo) {
      setSelectedCustomerName(customerInfo.name || '');
      setSelectedCustomerCpfCnpj(customerInfo.cpfCnpj || '');
      setValue('clientName', customerInfo.name || '');
      setValue('clientCpfCnpj', customerInfo.cpfCnpj || '');
    }
    
    // Adicionar método de pagamento a prazo automaticamente
    // Usar apenas o valor restante (sobra) em vez do total
    const remainingAmount = getRemainingAmount();
    const installmentPayment: PaymentMethodDetail = {
      method: 'installment',
      amount: remainingAmount > 0 ? remainingAmount : 0,
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
    setValue,
  } = useForm<{ clientName?: string; clientCpfCnpj?: string }>({});

  const handlePrintConfirm = async () => {
    if (!createdSaleId) return;
    
    setPrinting(true);
    try {
      await saleApi.reprint(createdSaleId);
      toast.success('NFC-e enviada para impressão!');
    } catch (error) {
      console.error('[Checkout] Erro ao imprimir NFC-e:', error);
      handleApiError(error);
    } finally {
      setPrinting(false);
      handlePrintComplete();
    }
  };

  const handlePrintCancel = () => {
    toast.success('Venda registrada sem impressão');
    handlePrintComplete();
  };

  const handlePrintComplete = () => {
    // Limpar carrinho e resetar formulário
    clearCart();
    reset();
    setPaymentDetails([]);
    setInstallmentData(null);
    setSelectedCustomerId('');
    setShowPrintConfirmation(false);
    setCreatedSaleId(null);
    onClose();
  };

  const onSubmit = async (data: { clientName?: string; clientCpfCnpj?: string }) => {
    console.log('[Checkout] Iniciando finalização de venda...');
    
    // Validar IDs dos produtos NO CARRINHO
    console.log('[Checkout] Validando IDs dos produtos:');
    for (const [index, item] of items.entries()) {
      const isValid = isValidId(item.product.id);
      console.log(`[Checkout] Item ${index}: ${item.product.name}`, {
        productId: item.product.id,
        isValidId: isValid
      });
      
      if (!isValid) {
        toast.error(`Produto "${item.product.name}" tem ID inválido. Remova-o do carrinho e adicione novamente.`);
        return;
      }
    }
    
    if (paymentDetails.length === 0) {
      toast.error('Adicione pelo menos um método de pagamento!');
      return;
    }

    // Validações específicas para venda a prazo
    const hasInstallment = hasInstallmentPayment();
    if (hasInstallment) {
      if (!installmentData || !selectedCustomerId) {
        toast.error('Complete a configuração da venda a prazo (cliente, parcelas e vencimento).');
        return;
      }
      if (!data.clientName || data.clientName.trim().length === 0) {
        toast.error('Nome do cliente é obrigatório para vendas a prazo.');
        return;
      }
    }

    // Impedir valores zerados/negativos em qualquer método
    const invalidPaymentIndex = paymentDetails.findIndex(p => Number(p.amount) < 0.01);
    if (invalidPaymentIndex !== -1) {
      toast.error('Há um método de pagamento com valor 0. Ajuste os valores antes de finalizar.');
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
  // Criar dados da venda com validações mínimas e sem conversões desnecessárias
      // Todos os IDs já são UUID v4 válidos
      const saleData: CreateSaleDto = {
        items: items.map((item) => {
          // Validar UUID (já validado acima, mas garantir)
          try {
            validateUUID(item.product.id, `Produto ${item.product.name}`);
          } catch (error) {
            throw new Error(`Produto "${item.product.name}" tem ID inválido: ${item.product.id}`);
          }
          
          return {
            productId: item.product.id, // Usar ID EXATAMENTE como está
            quantity: item.quantity,
          };
        }),
        paymentMethods: paymentDetails.map((payment) => {
          // Garantir que o valor seja sempre >= 0.01
          const amount = Math.max(Number(payment.amount) || 0, 0.01);
          
          const paymentMethod: any = {
            method: payment.method,
            amount: amount,
          };
          
          // Adicionar informações de parcelas para vendas a prazo
          if (payment.method === 'installment' && installmentData && selectedCustomerId) {
            paymentMethod.customerId = selectedCustomerId;
            paymentMethod.installments = installmentData.installments;
            
            // Garantir que a data seja enviada como ISO string
            paymentMethod.firstDueDate = installmentData.firstDueDate.toISOString();
            
            paymentMethod.description = installmentData.description || `Parcelado em ${installmentData.installments}x de ${formatCurrency(installmentData.installmentValue)}`;
            paymentMethod.additionalInfo = `Parcelado em ${installmentData.installments}x de ${formatCurrency(installmentData.installmentValue)}`;
          }
          
          return paymentMethod;
        }),
        clientName: data.clientName,
        clientCpfCnpj: data.clientCpfCnpj,
        sellerId: selectedSellerId || undefined, // Usar ID EXATAMENTE como está
      };
      
      // Validar sellerId se fornecido
      if (selectedSellerId) {
        try {
          validateUUID(selectedSellerId, 'Vendedor');
          console.log('[Checkout] SellerId válido:', selectedSellerId);
        } catch (error) {
          throw new Error(`Vendedor selecionado tem ID inválido: ${selectedSellerId}`);
        }
      }
      
      console.log('[Checkout] Dados da venda (sem conversões):', {
        itemCount: saleData.items.length,
        paymentMethodsCount: saleData.paymentMethods.length,
        sellerId: saleData.sellerId,
        total: total
      });

      // Criar venda - IDs já são UUID v4 válidos
      // Enviar skipPrint: true para não imprimir automaticamente
      const saleDataWithSkipPrint = {
        ...saleData,
        skipPrint: true,
      };
      
      const response = await saleApi.create(saleDataWithSkipPrint);
      
      // Extrair ID da venda da resposta
  const saleId = response.data?.id || (response.data?.data && response.data.data.id);
      
      if (!saleId) {
        console.error('[Checkout] Venda criada mas ID não foi retornado:', response);
        toast.error('Venda criada, mas não foi possível obter o ID da venda');
        return;
      }
      
      console.log('[Checkout] Venda criada com sucesso:', saleId);
      toast.success('Venda realizada com sucesso!');
      
      // Armazenar ID da venda e mostrar diálogo de confirmação
      setCreatedSaleId(saleId);
      setShowPrintConfirmation(true);
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
    <>
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
                        // Atualizar o valor para o restante antes de abrir o modal
                        const remainingAmount = getRemainingAmount();
                        updatePaymentMethod(index, 'amount', remainingAmount > 0 ? remainingAmount : 0);
                        setShowInstallmentModal(true);
                      } else {
                        updatePaymentMethod(index, 'method', value);
                      }
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
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
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
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
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Troco:</span>
                <span className="font-bold">{formatCurrency(getCashChange())}</span>
              </div>
            )}
            {installmentData && (
              <div className="flex justify-between text-blue-600 dark:text-blue-400">
                <span>Parcelas:</span>
                <span className="font-bold">{installmentData.installments}x de {formatCurrency(installmentData.installmentValue)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Restante:</span>
              <span className={getRemainingAmount() > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
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
          totalAmount={getRemainingAmount()}
        />
      </DialogContent>
    </Dialog>
    
    {/* Dialog de Confirmação de Impressão */}
    <PrintConfirmationDialog
      open={showPrintConfirmation}
      onConfirm={handlePrintConfirm}
      onCancel={handlePrintCancel}
      loading={printing}
    />
  </>
  );
}