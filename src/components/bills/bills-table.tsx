'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiCallWithIdConversion } from '@/lib/apiClient';
import type { BillToPay } from '@/types';

interface BillsTableProps {
  bills: BillToPay[];
  isLoading: boolean;
  onRefetch: () => void;
}

export function BillsTable({ bills, isLoading, onRefetch }: BillsTableProps) {
  const { api } = useAuth();
  const [paying, setPaying] = useState<string | null>(null);

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm('Marcar esta conta como paga?')) return;

    setPaying(id);
    try {
      // Tentar usar ID original primeiro
      try {
        await api.patch(`/bill-to-pay/${id}/mark-paid`, {});
        toast.success('Conta marcada como paga!');
        onRefetch();
      } catch (error: any) {
        // Se der erro de UUID, mostrar mensagem informativa
        if (error.response?.status === 400 && 
            error.response?.data?.message?.includes('uuid is expected')) {
          toast.error('Operação não disponível: Backend requer UUIDs para esta operação');
        } else {
          handleApiError(error);
        }
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setPaying(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando contas...</p>
        </div>
      </Card>
    );
  }

  if (bills.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">Nenhuma conta encontrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece adicionando uma nova conta a pagar.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Código de Barras</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => {
            const isOverdue = !bill.isPaid && new Date(bill.dueDate) < new Date();
            const isDueSoon =
              !bill.isPaid &&
              new Date(bill.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            return (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.description}</TableCell>
                <TableCell>{formatCurrency(bill.amount)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {bill.dueDate && bill.dueDate !== 'null' ? formatDate(bill.dueDate) : '-'}
                    {isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {isDueSoon && !isOverdue && (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {bill.isPaid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Pago
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                      Pendente
                    </span>
                  )}
                </TableCell>
                <TableCell>{bill.barcode || '-'}</TableCell>
                <TableCell className="text-right">
                  {!bill.isPaid && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsPaid(bill.id)}
                      disabled={paying === bill.id}
                    >
                      Marcar como Pago
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
