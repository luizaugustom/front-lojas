'use client';

import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, Repeat, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { printContent } from '@/lib/print-service';
import { handleApiError } from '@/lib/handleApiError';
import { ProcessExchangeDialog } from './process-exchange-dialog';
import type { Exchange } from '@/types';

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
    store_credit: 'Crédito em Loja',
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
    store_credit: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  };
  return colors[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

export function SaleDetailsDialog({ open, onClose, saleId }: SaleDetailsDialogProps) {
  const { api, user } = useAuth();
  const [isPrinting, setIsPrinting] = useState(false);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);

  const { data: sale, isLoading, refetch } = useQuery({
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
      let printType: string = 'nfce';

      // Primeiro, tentar obter conteúdo de impressão
      try {
        const response = await api.get(`/sale/${saleId}/print-content`);
        const data = response.data?.data || response.data;
        content = data?.content || null;
        printType = data?.printType || 'nfce';

        if (content) {
          console.log(`[SaleDetailsDialog] Conteúdo de impressão obtido (${printType})`);
        }
      } catch (error) {
        console.warn('[SaleDetailsDialog] Falha ao obter conteúdo de impressão direto, tentando reprint.', error);
      }

      // Se não conseguiu, tentar via reprint
      if (!content) {
        const reprintResponse = await api.post(`/sale/${saleId}/reprint`);
        const reprintData = reprintResponse.data?.data || reprintResponse.data;
        content = reprintData?.printContent || null;
        printType = reprintData?.printType || 'nfce';
      }

      // Se conseguiu obter conteúdo, imprimir localmente
      if (content) {
        console.log('[SaleDetailsDialog] Imprimindo localmente...');
        const result = await printContent(content);

        if (result.success) {
          toast.success('Cupom enviado para impressão!');
        } else {
          toast(`Impressão local falhou: ${result.error || 'Erro desconhecido'}. Tentando impressão no servidor...`, {
            icon: '⚠️',
            duration: 5000,
          });

          // Se falhar localmente, tentar no servidor como fallback
          try {
            await api.post(`/sale/${saleId}/reprint`);
            toast.success('Cupom enviado para impressão no servidor!');
          } catch (serverError) {
            console.error('[SaleDetailsDialog] Erro ao imprimir no servidor:', serverError);
          }
        }
      } else {
        // Se não conseguiu conteúdo, tentar impressão no servidor diretamente
        console.log('[SaleDetailsDialog] Sem conteúdo local, tentando impressão no servidor...');
        await api.post(`/sale/${saleId}/reprint`);
        toast.success('Cupom enviado para impressão!');
      }
    } catch (error: unknown) {
      let errorMessage = 'Erro ao reimprimir cupom';
      if (isAxiosError(error) && error.response?.data?.message) {
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

  const handleExchangeSuccess = async (exchange: Exchange) => {
    await refetch();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda</DialogTitle>
          <DialogDescription className="sr-only">
            Informações completas da venda selecionada
          </DialogDescription>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Trocas</h3>
                {user?.role !== 'vendedor' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExchangeDialogOpen(true)}
                  >
                    <Repeat className="mr-2 h-4 w-4" />
                    Processar troca
                  </Button>
                )}
              </div>
              {sale.exchanges && sale.exchanges.length > 0 ? (
                <div className="space-y-3">
                  {sale.exchanges.map((exchange: Exchange) => (
                    <div
                      key={exchange.id}
                      className="rounded-lg border bg-muted/30 p-4 space-y-3"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(exchange.exchangeDate)}
                          </p>
                          <p className="font-medium">{exchange.reason}</p>
                          {exchange.note && (
                            <p className="text-xs text-muted-foreground">{exchange.note}</p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <p>
                            Devolvido:{' '}
                            <span className="font-semibold">
                              {formatCurrency(exchange.returnedTotal)}
                            </span>
                          </p>
                          <p>
                            Entregue:{' '}
                            <span className="font-semibold">
                              {formatCurrency(exchange.deliveredTotal)}
                            </span>
                          </p>
                          <p>
                            Diferença:{' '}
                            <span className="font-semibold">
                              {formatCurrency(exchange.difference)}
                            </span>
                          </p>
                          {exchange.storeCreditAmount > 0 && (
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                Crédito em loja: {formatCurrency(exchange.storeCreditAmount)}
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={async () => {
                                  try {
                                    await api.post(`/sale/exchange/${exchange.id}/print-credit-voucher`);
                                    toast.success('Comprovante enviado para impressão!');
                                  } catch (error) {
                                    handleApiError(error);
                                  }
                                }}
                              >
                                <Printer className="h-3 w-3 mr-1" />
                                Imprimir
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm font-semibold mb-1">Itens devolvidos</p>
                          <div className="space-y-1 text-sm">
                            {exchange.returnedItems.length === 0 ? (
                              <p className="text-muted-foreground text-xs">Nenhum item devolvido.</p>
                            ) : (
                              exchange.returnedItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                  <span>
                                    {item.saleItem?.product?.name ?? item.product?.name ?? 'Produto'}
                                    {' • '}
                                    {item.quantity} un.
                                  </span>
                                  <span>{formatCurrency(item.totalPrice)}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-1">Itens entregues</p>
                          <div className="space-y-1 text-sm">
                            {exchange.deliveredItems.length === 0 ? (
                              <p className="text-muted-foreground text-xs">Nenhum item entregue.</p>
                            ) : (
                              exchange.deliveredItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                  <span>
                                    {item.product?.name ?? 'Produto'} • {item.quantity} un.
                                  </span>
                                  <span>{formatCurrency(item.totalPrice)}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {(exchange.payments.length > 0 || exchange.refunds.length > 0) && (
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          {exchange.payments.length > 0 && (
                            <div>
                              <p className="font-semibold mb-1">Pagamentos recebidos</p>
                              <div className="space-y-1">
                                {exchange.payments.map((payment) => (
                                  <div key={payment.id} className="flex items-center justify-between">
                                    <span>{getPaymentMethodLabel(payment.method)}</span>
                                    <span>{formatCurrency(payment.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {exchange.refunds.length > 0 && (
                            <div>
                              <p className="font-semibold mb-1">Reembolsos</p>
                              <div className="space-y-1">
                                {exchange.refunds.map((refund) => (
                                  <div key={refund.id} className="flex items-center justify-between">
                                    <span>{getPaymentMethodLabel(refund.method)}</span>
                                    <span>{formatCurrency(refund.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  {exchange.fiscalWarnings && exchange.fiscalWarnings.length > 0 && (
                    <div className="space-y-1">
                      {exchange.fiscalWarnings.map((warning, index) => (
                        <div
                          key={`${exchange.id}-warning-${index}`}
                          className="flex items-start gap-2 text-xs text-amber-600"
                        >
                          <AlertTriangle className="h-3 w-3 mt-0.5" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {exchange.fiscalDocuments && exchange.fiscalDocuments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Documentos fiscais</p>
                      <div className="space-y-2">
                        {exchange.fiscalDocuments.map((document) => (
                          <div
                            key={document.id}
                            className="border rounded-md bg-background p-3 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {document.origin === 'EXCHANGE_RETURN'
                                  ? 'Devolução (NFC-e)'
                                  : document.origin === 'EXCHANGE_DELIVERY'
                                  ? 'Itens entregues (NFC-e)'
                                  : document.documentType}
                              </span>
                              <Badge variant="outline">
                                {document.status || 'Em processamento'}
                              </Badge>
                            </div>
                            <div className="grid gap-1">
                              {document.documentNumber && (
                                <span>Número: {document.documentNumber}</span>
                              )}
                              {document.accessKey && (
                                <span className="break-all">
                                  Chave:{' '}
                                  <span className="font-mono">{document.accessKey}</span>
                                </span>
                              )}
                              {typeof document.totalValue === 'number' && (
                                <span>Total: {formatCurrency(document.totalValue)}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {document.pdfUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={document.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Ver PDF
                                  </a>
                                </Button>
                              )}
                              {document.qrCodeUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={document.qrCodeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Ver QR-Code
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma troca registrada para esta venda.
                </p>
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

      <ProcessExchangeDialog
        open={exchangeDialogOpen}
        onClose={() => setExchangeDialogOpen(false)}
        sale={sale ?? null}
        onSuccess={handleExchangeSuccess}
      />
    </Dialog>
  );
}

