'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, CreditCard, Trash2 } from 'lucide-react';
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
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { BillToPay } from '@/types';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface BillsTableProps {
  bills: BillToPay[];
  isLoading: boolean;
  onRefetch: () => void;
}

export function BillsTable({ bills, isLoading, onRefetch }: BillsTableProps) {
  const { api } = useAuth();
  const [paying, setPaying] = useState<string | null>(null);
  const [confirmingBillId, setConfirmingBillId] = useState<string | null>(null);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalItems = bills.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [totalItems]);

  const paginatedBills = bills.slice((page - 1) * pageSize, page * pageSize);

  const handleMarkAsPaid = async (id: string) => {
    setConfirmingBillId(id);
  };

  const confirmMarkAsPaid = async () => {
    if (!confirmingBillId) return;

    const id = confirmingBillId;
    setConfirmingBillId(null);
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

  const handleDelete = async (id: string) => {
    setDeletingBillId(id);
  };

  const confirmDelete = async () => {
    if (!deletingBillId) return;

    const id = deletingBillId;
    setDeletingBillId(null);
    setIsDeleting(true);
    
    try {
      await api.delete(`/bill-to-pay/${id}`);
      toast.success('Conta excluída com sucesso!');
      onRefetch();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const billToConfirm = bills.find(bill => bill.id === confirmingBillId);
  const billToDelete = bills.find(bill => bill.id === deletingBillId);

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
    <>
      <ConfirmationModal
        open={confirmingBillId !== null}
        onClose={() => setConfirmingBillId(null)}
        onConfirm={confirmMarkAsPaid}
        title="Marcar conta como paga"
        description={
          billToConfirm
            ? `Deseja marcar a conta "${billToConfirm.title || billToConfirm.description}" no valor de ${formatCurrency(billToConfirm.amount)} como paga?`
            : 'Deseja marcar esta conta como paga?'
        }
        confirmText="Sim, marcar como paga"
        cancelText="Cancelar"
        variant="default"
        loading={paying !== null}
      />
      <ConfirmationModal
        open={deletingBillId !== null}
        onClose={() => setDeletingBillId(null)}
        onConfirm={confirmDelete}
        title="Excluir conta a pagar"
        description={
          billToDelete
            ? `Tem certeza que deseja excluir a conta "${billToDelete.title || billToDelete.description}" no valor de ${formatCurrency(billToDelete.amount)}? Esta ação não pode ser desfeita.`
            : 'Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.'
        }
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        variant="destructive"
        loading={isDeleting}
      />
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
          {paginatedBills.map((bill) => {
            const isOverdue = !bill.isPaid && new Date(bill.dueDate) < new Date();
            const isDueSoon =
              !bill.isPaid &&
              new Date(bill.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            return (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.title || bill.description || '-'}</TableCell>
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
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {!bill.isPaid ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(bill.id)}
                          disabled={paying === bill.id}
                        >
                          Marcar como Pago
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(bill.id)}
                          disabled={isDeleting && deletingBillId === bill.id}
                          title="Excluir conta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(bill.id)}
                        disabled={isDeleting && deletingBillId === bill.id}
                        title="Excluir conta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          totalItems={totalItems}
        />
    </Card>
    </>
  );
}
