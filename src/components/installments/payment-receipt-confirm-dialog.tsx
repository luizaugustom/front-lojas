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
import { Printer, X } from 'lucide-react';

interface PaymentReceiptConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentReceiptConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: PaymentReceiptConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Imprimir Comprovante
          </DialogTitle>
          <DialogDescription>
            Deseja imprimir um comprovante de pagamento desta parcela?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Não Imprimir
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Sim, Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
