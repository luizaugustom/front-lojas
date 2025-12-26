'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BulkPaymentReceiptProps {
  paymentData: {
    totalPaid: number;
    paymentMethod: string;
    date: string;
    notes?: string;
    sellerName?: string;
    payments: Array<{
      installmentId: string;
      amountPaid: number;
      remainingAmount: number;
      isPaid: boolean;
      dueDate?: string | null;
    }>;
  };
  customerInfo?: {
    id: string;
    name: string;
    cpfCnpj?: string;
    phone?: string;
  };
  companyInfo?: {
    name: string;
    cnpj?: string;
    address?: string;
  };
  installmentsData?: Array<{
    id: string;
    installmentNumber: number;
    totalInstallments: number;
    amount: number | string;
    remainingAmount: number | string;
    dueDate: string;
  }>;
  onPrintComplete?: () => void;
}

const getPaymentMethodLabel = (method: string) => {
  const methods: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
  };
  return methods[method] || method;
};

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return Number(value) || 0;
};

export function BulkPaymentReceipt({
  paymentData,
  customerInfo,
  companyInfo,
  installmentsData = [],
  onPrintComplete,
}: BulkPaymentReceiptProps) {
  const [remainingDebts, setRemainingDebts] = useState<Array<{
    id: string;
    installmentNumber: number;
    totalInstallments: number;
    amount: number;
    remainingAmount: number;
    dueDate: string;
  }>>([]);
  const [totalRemainingDebt, setTotalRemainingDebt] = useState<number | null>(null);
  const [isLoadingDebt, setIsLoadingDebt] = useState<boolean>(true);

  const customerId = customerInfo?.id;

  useEffect(() => {
    let isCancelled = false;

    async function loadRemainingDebts() {
      try {
        setIsLoadingDebt(true);

        if (!customerId) {
          setRemainingDebts([]);
          setTotalRemainingDebt(null);
          return;
        }

        const resp = await api.get(`/installment/customer/${customerId}/summary`);
        const raw = resp?.data ?? {};
        const installmentsList: any[] = Array.isArray(raw.installments) ? raw.installments : [];

        // Filtrar apenas parcelas com saldo pendente
        const pending = installmentsList
          .filter((inst) => {
            const remaining = toNumber(inst.remainingAmount ?? inst.amount);
            return remaining > 0;
          })
          .map((inst) => ({
            id: inst.id,
            installmentNumber: inst.installmentNumber,
            totalInstallments: inst.totalInstallments,
            amount: toNumber(inst.amount),
            remainingAmount: toNumber(inst.remainingAmount ?? inst.amount),
            dueDate: inst.dueDate,
          }));

        const total = pending.reduce((sum, inst) => sum + inst.remainingAmount, 0);

        if (!isCancelled) {
          setRemainingDebts(pending);
          setTotalRemainingDebt(total);
        }
      } catch (err) {
        if (isCancelled) return;

        // Usar dados fornecidos como fallback
        if (installmentsData && installmentsData.length > 0) {
          const pending = installmentsData
            .filter((inst) => {
              const remaining = toNumber(inst.remainingAmount ?? inst.amount);
              return remaining > 0;
            })
            .map((inst) => ({
              id: inst.id,
              installmentNumber: inst.installmentNumber,
              totalInstallments: inst.totalInstallments,
              amount: toNumber(inst.amount),
              remainingAmount: toNumber(inst.remainingAmount ?? inst.amount),
              dueDate: inst.dueDate,
            }));

          const total = pending.reduce((sum, inst) => sum + inst.remainingAmount, 0);
          setRemainingDebts(pending);
          setTotalRemainingDebt(total);
        } else {
          setRemainingDebts([]);
          setTotalRemainingDebt(null);
        }
      } finally {
        if (!isCancelled) setIsLoadingDebt(false);
      }
    }

    loadRemainingDebts();

    return () => {
      isCancelled = true;
    };
  }, [customerId, installmentsData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      if (onPrintComplete) {
        onPrintComplete();
      }
    }, isLoadingDebt ? 900 : 500);

    return () => clearTimeout(timer);
  }, [onPrintComplete, isLoadingDebt]);

  // Combinar dados das parcelas pagas com informações adicionais se disponível
  const paidInstallments = useMemo(() => {
    if (!paymentData?.payments || !Array.isArray(paymentData.payments)) {
      return [];
    }
    return paymentData.payments.map((payment) => {
      const installmentInfo = installmentsData?.find((inst) => inst.id === payment.installmentId);
      return {
        ...payment,
        installmentNumber: installmentInfo?.installmentNumber || '?',
        totalInstallments: installmentInfo?.totalInstallments || '?',
      };
    });
  }, [paymentData?.payments, installmentsData]);

  return (
    <div className="print-only">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only,
            .print-only * {
              visibility: visible;
            }
            .print-only { position: absolute; left: 0; top: 0; width: 100%; }
            @page {
              size: auto;
              margin: 5mm;
            }
          }
          @media screen {
            .print-only {
              display: none;
            }
          }
        `}
      </style>

      {/* Layout estilo cupom não fiscal (bobina) */}
      <div style={{ padding: '8px', fontFamily: 'monospace', maxWidth: '280px', margin: '0 auto', fontSize: '12px' }}>
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>COMPROVANTE DE PAGAMENTO</div>
          {companyInfo && (
            <div style={{ marginTop: '4px' }}>
              <div style={{ fontSize: '11px' }}>{companyInfo.name}</div>
              {companyInfo.cnpj && <div style={{ fontSize: '11px' }}>CNPJ: {companyInfo.cnpj}</div>}
              {companyInfo.address && <div style={{ fontSize: '11px' }}>{companyInfo.address}</div>}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        <div>
          <div style={{ fontWeight: 'bold' }}>Pagamento</div>
          <div>Data: {new Date(paymentData.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(paymentData.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
          <div>Método: {getPaymentMethodLabel(paymentData.paymentMethod)}</div>
          <div>Total pago: {formatCurrency(paymentData.totalPaid)}</div>
          {paymentData.sellerName && <div>Recebido por: {paymentData.sellerName}</div>}
          {paymentData.notes && <div>Obs: {paymentData.notes}</div>}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        {customerInfo && (
          <div>
            <div style={{ fontWeight: 'bold' }}>Cliente</div>
            <div>{customerInfo.name}</div>
            {customerInfo.cpfCnpj && <div>CPF/CNPJ: {customerInfo.cpfCnpj}</div>}
            {customerInfo.phone && <div>Tel: {customerInfo.phone}</div>}
          </div>
        )}

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        <div>
          <div style={{ fontWeight: 'bold' }}>Parcelas Pagas ({paidInstallments.length})</div>
          {paidInstallments.length === 0 ? (
            <div>Nenhuma parcela paga</div>
          ) : (
            paidInstallments.map((payment, index) => (
              <div key={payment.installmentId || index} style={{ marginTop: index > 0 ? '6px' : '0', fontSize: '11px' }}>
                <div>Parcela {payment.installmentNumber}/{payment.totalInstallments}</div>
                <div>Valor pago: {formatCurrency(payment.amountPaid || 0)}</div>
                {payment.isPaid ? (
                  <div style={{ color: '#008000', fontWeight: 'bold' }}>✓ Pago integralmente</div>
                ) : (
                  <div>Saldo restante: {formatCurrency(payment.remainingAmount || 0)}</div>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        <div>
          <div style={{ fontWeight: 'bold' }}>Dívidas Pendentes</div>
          {isLoadingDebt ? (
            <div>Calculando...</div>
          ) : remainingDebts.length === 0 ? (
            <div style={{ color: '#008000', fontWeight: 'bold' }}>✓ Nenhuma dívida pendente</div>
          ) : (
            <>
              {remainingDebts.map((debt, index) => (
                <div key={debt.id || index} style={{ marginTop: index > 0 ? '4px' : '0', fontSize: '11px' }}>
                  <div>Parcela {debt.installmentNumber}/{debt.totalInstallments} - {formatCurrency(debt.remainingAmount)}</div>
                  {debt.dueDate && <div style={{ fontSize: '10px' }}>Venc: {formatDate(debt.dueDate)}</div>}
                </div>
              ))}
              <div style={{ marginTop: '6px', fontWeight: 'bold', borderTop: '1px dashed #000', paddingTop: '4px' }}>
                Total em aberto: {totalRemainingDebt !== null ? formatCurrency(totalRemainingDebt) : 'Não disponível'}
              </div>
            </>
          )}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '11px', color: '#444' }}>
          <div>Emitido em: {new Date().toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</div>
          <div style={{ marginTop: '4px' }}>Documento não fiscal</div>
          <div style={{ marginTop: '4px' }}>Obrigado pela preferência!</div>
          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
          <div style={{ marginTop: '2px', fontWeight: 'bold' }}>MontShop</div>
          <div style={{ fontSize: '10px' }}>sistemamontshop.com</div>
        </div>
      </div>
    </div>
  );
}

