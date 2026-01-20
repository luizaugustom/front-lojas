'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface StoreCreditVoucherConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  creditUsed: number;
  remainingBalance: number;
}

export function StoreCreditVoucherConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  loading = false,
  creditUsed,
  remainingBalance,
}: StoreCreditVoucherConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              Imprimir Comprovante de Saldo Restante?
            </DialogTitle>
          </div>
          <DialogDescription className="text-base mt-2">
            Crédito de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creditUsed)}</strong> foi utilizado na venda.
            <br />
            <br />
            Saldo restante: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remainingBalance)}</strong>
            <br />
            <br />
            Deseja imprimir um comprovante com o saldo restante?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Não Imprimir
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            {loading ? 'Imprimindo...' : 'Sim, Imprimir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

