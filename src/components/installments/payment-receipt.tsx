'use client';

import { useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface PaymentReceiptProps {
  installment: any;
  payment: {
    amount: number;
    paymentMethod: string;
    date: string;
    notes?: string;
  };
  customerInfo?: {
    name: string;
    cpfCnpj?: string;
    phone?: string;
  };
  companyInfo?: {
    name: string;
    cnpj?: string;
    address?: string;
  };
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

export function PaymentReceipt({
  installment,
  payment,
  customerInfo,
  companyInfo,
  onPrintComplete,
}: PaymentReceiptProps) {
  useEffect(() => {
    // Aguarda um pequeno delay para garantir que o conteúdo foi renderizado
    const timer = setTimeout(() => {
      window.print();
      if (onPrintComplete) {
        onPrintComplete();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [onPrintComplete]);

  const remainingAmount = installment.remainingAmount || 0;
  const originalAmount = installment.amount || 0;
  const paidAmount = originalAmount - remainingAmount;
  const newRemainingAmount = remainingAmount - payment.amount;

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
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            @page {
              size: auto;
              margin: 10mm;
            }
          }
          @media screen {
            .print-only {
              display: none;
            }
          }
        `}
      </style>

      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
          <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>COMPROVANTE DE PAGAMENTO</h1>
          {companyInfo && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <p style={{ margin: '5px 0' }}><strong>{companyInfo.name}</strong></p>
              {companyInfo.cnpj && <p style={{ margin: '5px 0' }}>CNPJ: {companyInfo.cnpj}</p>}
              {companyInfo.address && <p style={{ margin: '5px 0' }}>{companyInfo.address}</p>}
            </div>
          )}
        </div>

        {/* Informações do Pagamento */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Dados do Pagamento
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', width: '40%', fontWeight: 'bold' }}>Data do Pagamento:</td>
                <td style={{ padding: '8px 0' }}>
                  {new Date(payment.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Método de Pagamento:</td>
                <td style={{ padding: '8px 0' }}>{getPaymentMethodLabel(payment.paymentMethod)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Valor Pago:</td>
                <td style={{ padding: '8px 0', fontSize: '18px', color: '#16a34a', fontWeight: 'bold' }}>
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
              {payment.notes && (
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Observações:</td>
                  <td style={{ padding: '8px 0' }}>{payment.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Informações do Cliente */}
        {customerInfo && (
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
              Dados do Cliente
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', width: '40%', fontWeight: 'bold' }}>Nome:</td>
                  <td style={{ padding: '8px 0' }}>{customerInfo.name}</td>
                </tr>
                {customerInfo.cpfCnpj && (
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>CPF/CNPJ:</td>
                    <td style={{ padding: '8px 0' }}>{customerInfo.cpfCnpj}</td>
                  </tr>
                )}
                {customerInfo.phone && (
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Telefone:</td>
                    <td style={{ padding: '8px 0' }}>{customerInfo.phone}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Informações da Parcela */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Detalhes da Parcela
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', width: '40%', fontWeight: 'bold' }}>Parcela:</td>
                <td style={{ padding: '8px 0' }}>
                  {installment.installmentNumber} de {installment.totalInstallments}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Valor Original da Parcela:</td>
                <td style={{ padding: '8px 0' }}>{formatCurrency(originalAmount)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Total Pago Anteriormente:</td>
                <td style={{ padding: '8px 0' }}>{formatCurrency(paidAmount)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Valor Pago Agora:</td>
                <td style={{ padding: '8px 0', color: '#16a34a', fontWeight: 'bold' }}>
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
              <tr style={{ borderTop: '2px solid #333' }}>
                <td style={{ padding: '12px 0', fontWeight: 'bold', fontSize: '16px' }}>
                  Saldo Restante da Parcela:
                </td>
                <td style={{ padding: '12px 0', fontSize: '18px', fontWeight: 'bold', color: newRemainingAmount > 0 ? '#dc2626' : '#16a34a' }}>
                  {formatCurrency(newRemainingAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumo da Conta */}
        {installment.sale && (
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
              Resumo da Venda
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', width: '40%', fontWeight: 'bold' }}>Data da Venda:</td>
                  <td style={{ padding: '8px 0' }}>
                    {new Date(installment.sale.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Valor Total da Venda:</td>
                  <td style={{ padding: '8px 0' }}>{formatCurrency(installment.sale.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Rodapé */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center', fontSize: '11px', color: '#666' }}>
          <p style={{ margin: '5px 0' }}>
            Este documento é um comprovante de pagamento e deve ser guardado para controle financeiro.
          </p>
          <p style={{ margin: '5px 0' }}>
            Emitido em: {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
