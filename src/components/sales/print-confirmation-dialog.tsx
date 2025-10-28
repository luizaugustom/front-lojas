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
import { Printer } from 'lucide-react';

interface PrintConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PrintConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  loading = false,
}: PrintConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Printer className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              Imprimir NFC-e?
            </DialogTitle>
          </div>
          <DialogDescription className="text-base mt-2">
            Deseja imprimir a Nota Fiscal do Consumidor Eletrônica (NFC-e) desta venda agora?
            <br />
            <br />
            A nota será enviada para a impressora térmica cadastrada.
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
            <Printer className="h-4 w-4" />
            {loading ? 'Imprimindo...' : 'Imprimir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

