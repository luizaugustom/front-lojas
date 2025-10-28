'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, CreditCard, Banknote, Smartphone } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  installment: any;
}

interface PaymentFormData {
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export function PaymentDialog({ open, onClose, installment }: PaymentDialogProps) {
  const { api } = useAuth();
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    defaultValues: {
      paymentMethod: 'cash',
    },
  });

  const amount = watch('amount');

  useEffect(() => {
    if (open && installment) {
      const fullAmount = installment.remainingAmount || 0;
      setValue('amount', fullAmount);
      setPaymentType('full');
    }
  }, [open, installment, setValue]);

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      return api.post(`/installment/${installment.id}/pay`, data);
    },
    onSuccess: (response) => {
      toast.success(response.data.message || 'Pagamento registrado com sucesso!');
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar pagamento');
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    if (data.amount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    if (data.amount > installment.remainingAmount) {
      toast.error('O valor não pode ser maior que o valor restante');
      return;
    }

    paymentMutation.mutate(data);
  };

  const handlePaymentTypeChange = (type: 'full' | 'partial') => {
    setPaymentType(type);
    if (type === 'full') {
      setValue('amount', installment.remainingAmount || 0);
    } else {
      setValue('amount', 0);
    }
  };

  if (!installment) return null;

  const remainingAmount = installment.remainingAmount || 0;
  const originalAmount = installment.amount || 0;
  const paidAmount = originalAmount - remainingAmount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Informações da Parcela */}
          <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cliente:</span>
              <span className="text-sm font-medium">{installment.customer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Parcela:</span>
              <span className="text-sm font-medium">
                {installment.installmentNumber}/{installment.totalInstallments}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor Original:</span>
              <span className="text-sm font-medium">{formatCurrency(originalAmount)}</span>
            </div>
            {paidAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Já Pago:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(paidAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-semibold">Valor Restante:</span>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          {/* Tipo de Pagamento */}
          <div className="space-y-2">
            <Label>Tipo de Pagamento</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={paymentType === 'full' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handlePaymentTypeChange('full')}
              >
                Pagamento Total
              </Button>
              <Button
                type="button"
                variant={paymentType === 'partial' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handlePaymentTypeChange('partial')}
              >
                Pagamento Parcial
              </Button>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Valor a Pagar <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                className="pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                {...register('amount', {
                  required: 'Valor é obrigatório',
                  min: { value: 0.01, message: 'Valor mínimo é R$ 0,01' },
                  max: {
                    value: remainingAmount,
                    message: 'Valor não pode ser maior que o restante',
                  },
                  valueAsNumber: true,
                })}
                onFocus={(e) => {
                  if (Number(e.target.value) === 0) {
                    e.target.value = '';
                  }
                }}
                disabled={paymentType === 'full'}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
            {paymentType === 'partial' && amount > 0 && (
              <p className="text-xs text-muted-foreground">
                Restará: {formatCurrency(remainingAmount - amount)}
              </p>
            )}
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">
              Método de Pagamento <span className="text-destructive">*</span>
            </Label>
            <Select
              defaultValue="cash"
              onValueChange={(value) => setValue('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Dinheiro
                  </div>
                </SelectItem>
                <SelectItem value="pix">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    PIX
                  </div>
                </SelectItem>
                <SelectItem value="credit_card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cartão de Crédito
                  </div>
                </SelectItem>
                <SelectItem value="debit_card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cartão de Débito
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre o pagamento (opcional)"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={paymentMutation.isPending}>
              {paymentMutation.isPending ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

