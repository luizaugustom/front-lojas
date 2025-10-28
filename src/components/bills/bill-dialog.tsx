'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { billSchema } from '@/lib/validations';
import { generateCoherentUUID, handleNumberInputChange } from '@/lib/utils';
import type { CreateBillDto } from '@/types';

interface BillDialogProps {
  open: boolean;
  onClose: () => void;
}

export function BillDialog({ open, onClose }: BillDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const { api } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CreateBillDto>({
    resolver: zodResolver(billSchema),
  });

  const onSubmit = async (data: CreateBillDto) => {
    setLoading(true);
    try {
      const billData = {
        ...data,
        activityId: generateCoherentUUID(), // UUID coerente para rastreamento de atividades
      };
      await api.post('/bill-to-pay', billData);
      toast.success('Conta criada com sucesso!');
      reset();
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Conta a Pagar</DialogTitle>
          <DialogDescription className="text-muted-foreground">Preencha os dados da nova conta</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Título *</Label>
            <Input id="title" {...register('title')} disabled={loading} className="text-foreground" />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">Valor *</Label>
            <Input
              id="amount"
              type="text"
              value={amountInput}
              onChange={(e) => handleNumberInputChange(e, (value) => {
                setAmountInput(value);
                // Atualizar o valor no form register
                const event = { target: { value: Number(value) || 0 } } as any;
                register('amount').onChange(event);
              })}
              onBlur={() => {
                if (amountInput === '') {
                  setAmountInput('0');
                  const event = { target: { value: 0 } } as any;
                  register('amount').onChange(event);
                }
              }}
              disabled={loading}
              className="no-spinner text-foreground"
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-foreground">Data de Vencimento *</Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                  placeholder="Selecione a data de vencimento"
                  disabled={loading}
                />
              )}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode" className="text-foreground">Código de Barras</Label>
            <Input id="barcode" {...register('barcode')} disabled={loading} className="text-foreground" />
            {errors.barcode && (
              <p className="text-sm text-destructive">{errors.barcode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentInfo" className="text-foreground">Informações de Pagamento</Label>
            <Input
              id="paymentInfo"
              placeholder="Ex: Banco XYZ, Conta 12345"
              {...register('paymentInfo')}
              disabled={loading}
              className="text-foreground"
            />
            {errors.paymentInfo && (
              <p className="text-sm text-destructive">{errors.paymentInfo.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-foreground">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
