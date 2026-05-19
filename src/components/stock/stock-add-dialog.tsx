'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';

const stockAddFormSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  quantity: z.number().positive('Quantidade deve ser positiva').min(0.001, 'Quantidade mínima é 0,001'),
  batchNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  notes: z.string().optional(),
});

type StockAddFormData = z.infer<typeof stockAddFormSchema>;

interface StockAddDialogProps {
  open: boolean;
  onClose: () => void;
  initialProduct?: { id: string; name: string; stockQuantity: number } | null;
}

export function StockAddDialog({ open, onClose, initialProduct }: StockAddDialogProps) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StockAddFormData>({
    resolver: zodResolver(stockAddFormSchema),
    defaultValues: {
      productId: '',
      quantity: 1,
    },
  });

  const selectedProductId = watch('productId');

  // Buscar produtos
  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      return (await api.get('/product')).data;
    },
  });

  const products = productsResponse?.products || [];
  const selectedProduct = products.find((p: any) => p.id === selectedProductId);

  useEffect(() => {
    if (!open) {
      reset();
    } else {
      if (initialProduct) {
        setValue('productId', initialProduct.id);
      }
    }
  }, [open, reset, initialProduct, setValue]);

  const onSubmit = async (data: StockAddFormData) => {
    try {
      setLoading(true);

      const payload: any = {
        quantity: data.quantity,
      };

      if (data.batchNumber) {
        payload.batchNumber = data.batchNumber;
      }

      if (data.expirationDate) {
        payload.expirationDate = data.expirationDate;
      }

      if (data.notes) {
        payload.notes = data.notes;
      }

      await api.post(`/product/${data.productId}/stock`, payload);

      toast.success('Estoque adicionado com sucesso!');
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Estoque</DialogTitle>
          <DialogDescription>
            Adicione quantidade ao estoque de um produto (entrada de mercadoria, ajuste, etc.)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Produto *</Label>
            <select
              id="productId"
              value={selectedProductId || ''}
              onChange={(e) => setValue('productId', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={loading || !!initialProduct}
            >
              <option value="">Selecione o produto</option>
              {products.map((product: any) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Estoque atual: {product.stockQuantity}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-sm text-destructive">{errors.productId.message}</p>
            )}
            {selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Estoque disponível: {selectedProduct.stockQuantity} unidades
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              type="number"
              step="0.001"
              min="0.001"
              {...register('quantity', { valueAsNumber: true })}
              disabled={loading || !selectedProductId}
              placeholder="Ex: 1.5 (kg, m, etc)"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use ponto para separar decimais. Ex: 1.5 para 1,5 kg
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Número do Lote (opcional)</Label>
              <Input
                id="batchNumber"
                {...register('batchNumber')}
                disabled={loading}
                placeholder="Lote do fornecedor"
              />
              {errors.batchNumber && (
                <p className="text-sm text-destructive">{errors.batchNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Data de Validade (opcional)</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register('expirationDate')}
                disabled={loading}
              />
              {errors.expirationDate && (
                <p className="text-sm text-destructive">{errors.expirationDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              disabled={loading}
              placeholder="Observações sobre esta entrada de estoque..."
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar Estoque'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}