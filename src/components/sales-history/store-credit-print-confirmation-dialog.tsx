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
import { Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StoreCreditPrintConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  creditAmount: number;
}

export function StoreCreditPrintConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  loading = false,
  creditAmount,
}: StoreCreditPrintConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              Imprimir Comprovante de Crédito?
            </DialogTitle>
          </div>
          <DialogDescription className="text-base mt-2">
            <div className="space-y-2">
              <p>
                Crédito em loja de <span className="font-semibold text-primary">{formatCurrency(creditAmount)}</span> gerado com sucesso!
              </p>
              <p className="mt-4">
                Deseja imprimir o comprovante agora?
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                O comprovante será enviado para a impressora térmica configurada.
              </p>
            </div>
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
            <Receipt className="h-4 w-4" />
            {loading ? 'Imprimindo...' : 'Imprimir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

