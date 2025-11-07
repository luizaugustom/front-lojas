'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { printContent } from '@/lib/print-service';

interface SaleDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  saleId: string;
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    cash: 'Dinheiro',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    pix: 'PIX',
    installment: 'Parcelado',
  };
  return labels[method] || method;
};

const getPaymentMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    cash: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    credit_card: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    debit_card: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    pix: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    installment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };
  return colors[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

export function SaleDetailsDialog({ open, onClose, saleId }: SaleDetailsDialogProps) {
  const { api } = useAuth();
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: sale, isLoading } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: async () => {
      const response = await api.get(`/sale/${saleId}`);
      return response.data;
    },
    enabled: open && !!saleId,
  });

  const handleReprint = async () => {
    if (isPrinting) return;

    setIsPrinting(true);

    try {
      let content: string | null = null;

      try {
        const response = await api.get(`/sale/${saleId}/print-content`);
        const data = response.data?.data || response.data;
        content = data?.content || null;

        if (content && data?.printType) {
          console.log(`[SaleDetailsDialog] Conteúdo de impressão obtido (${data.printType})`);
        }
      } catch (error) {
        console.warn('[SaleDetailsDialog] Falha ao obter conteúdo de impressão direto, tentando reprint.', error);
      }

      if (!content) {
        const reprintResponse = await api.post(`/sale/${saleId}/reprint`);
        const reprintData = reprintResponse.data?.data || reprintResponse.data;
        content = reprintData?.printContent || null;

        if (!content) {
          toast.success('Cupom reenviado para impressão!');
          return;
        }
      }

      const result = await printContent(content);

      if (result.success) {
        toast.success('Cupom enviado para impressão!');
      } else {
        toast(`Impressão local falhou: ${result.error || 'Erro desconhecido'}. Tentando impressão no servidor...`, {
          icon: '⚠️',
          duration: 5000,
        });

        await api.post(`/sale/${saleId}/reprint`);
        toast.success('Cupom reenviado para impressão no servidor!');
      }
    } catch (error) {
      let errorMessage = 'Erro ao reimprimir cupom';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 6000,
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : sale ? (
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Data da Venda</p>
                <p className="font-medium">{formatDate(sale.saleDate || sale.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendedor</p>
                <p className="font-medium">{sale.seller?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{sale.clientName || 'Cliente Anônimo'}</p>
                {sale.clientCpfCnpj && (
                  <p className="text-xs text-muted-foreground">{sale.clientCpfCnpj}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID da Venda</p>
                <p className="font-mono text-xs">{sale.id}</p>
              </div>
            </div>

            {/* Itens da Venda */}
            <div>
              <h3 className="font-semibold mb-3">Itens da Venda</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">Produto</th>
                      <th className="px-4 py-2 text-center text-sm font-medium">Qtd.</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Preço Unit.</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sale.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">
                          {item.product?.name || 'Produto'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Métodos de Pagamento */}
            <div>
              <h3 className="font-semibold mb-3">Formas de Pagamento</h3>
              <div className="space-y-2">
                {sale.paymentMethods && sale.paymentMethods.length > 0 ? (
                  sale.paymentMethods.map((pm: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <Badge className={getPaymentMethodColor(pm.method)}>
                        {getPaymentMethodLabel(pm.method)}
                      </Badge>
                      <span className="font-medium">{formatCurrency(pm.amount)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sem informações de pagamento</p>
                )}
              </div>
            </div>

            {/* Totais */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
              {sale.change > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                  <span>Troco</span>
                  <span>{formatCurrency(sale.change)}</span>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button onClick={handleReprint} className="flex-1" disabled={isPrinting}>
                <Printer className="mr-2 h-4 w-4" />
                {isPrinting ? 'Reimprimindo...' : 'Reimprimir Cupom'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Venda não encontrada</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

