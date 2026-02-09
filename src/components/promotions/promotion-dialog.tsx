'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { X, Search } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency } from '@/lib/utils';
import type { Product, Promotion } from '@/types';

interface PromotionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promotion?: Promotion;
  selectedProducts?: Product[];
}

interface PromotionFormData {
  name: string;
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountPercentage?: number;
  promotionalPrice?: number;
  productIds: string[];
  isActive: boolean;
}

export function PromotionDialog({
  open,
  onClose,
  onSuccess,
  promotion,
  selectedProducts = [],
}: PromotionDialogProps) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const isEditing = !!promotion;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<PromotionFormData>({
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      discountType: 'percentage',
      discountPercentage: undefined,
      promotionalPrice: undefined,
      productIds: [],
      isActive: true,
    },
  });

  const discountType = watch('discountType');
  const selectedProductIds = watch('productIds') || [];

  // Preencher formulário ao editar
  useEffect(() => {
    if (promotion && open) {
      const startDate = new Date(promotion.startDate).toISOString().split('T')[0];
      const endDate = new Date(promotion.endDate).toISOString().split('T')[0];
      const discountType = promotion.discountPercentage ? 'percentage' : 'fixed';
      
      reset({
        name: promotion.name,
        startDate,
        endDate,
        discountType,
        discountPercentage: promotion.discountPercentage,
        promotionalPrice: promotion.promotionalPrice,
        productIds: promotion.products.map((p) => p.id),
        isActive: promotion.isActive,
      });
    } else if (selectedProducts.length > 0 && open) {
      reset({
        productIds: selectedProducts.map((p) => p.id),
      });
    } else if (open) {
      reset({
        name: '',
        startDate: '',
        endDate: '',
        discountType: 'percentage',
        discountPercentage: undefined,
        promotionalPrice: undefined,
        productIds: [],
        isActive: true,
      });
    }
  }, [promotion, selectedProducts, open, reset]);

  const loadProducts = useCallback(async () => {
    try {
      const response = await api.get('/product', { params: { limit: 1000 } });
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }, [api]);

  // Carregar produtos
  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open, loadProducts]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (productId: string) => {
    const currentIds = selectedProductIds || [];
    if (currentIds.includes(productId)) {
      setValue(
        'productIds',
        currentIds.filter((id) => id !== productId)
      );
    } else {
      setValue('productIds', [...currentIds, productId]);
    }
  };

  const onSubmit = async (data: PromotionFormData) => {
    try {
      setLoading(true);

      if (!data.productIds || data.productIds.length === 0) {
        toast.error('Selecione pelo menos um produto');
        return;
      }

      if (data.discountType === 'percentage' && !data.discountPercentage) {
        toast.error('Informe o percentual de desconto');
        return;
      }

      if (data.discountType === 'fixed' && !data.promotionalPrice) {
        toast.error('Informe o preço promocional');
        return;
      }

      const payload: any = {
        name: data.name,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        productIds: data.productIds,
        isActive: data.isActive,
      };

      if (data.discountType === 'percentage') {
        payload.discountPercentage = data.discountPercentage;
      } else {
        payload.promotionalPrice = data.promotionalPrice;
      }

      if (isEditing && promotion) {
        await api.patch(`/promotion/${promotion.id}`, payload);
        toast.success('Promoção atualizada com sucesso!');
      } else {
        await api.post('/promotion', payload);
        toast.success('Promoção criada com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Promoção' : 'Nova Promoção'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações da promoção'
              : 'Crie uma nova promoção para seus produtos'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome da Promoção *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Nome é obrigatório' })}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate', { required: 'Data de início é obrigatória' })}
                disabled={loading}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">Data de Término *</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate', { required: 'Data de término é obrigatória' })}
                disabled={loading}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label>Tipo de Desconto *</Label>
              <Controller
                name="discountType"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        {...field}
                        value="percentage"
                        checked={field.value === 'percentage'}
                      />
                      Percentual
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        {...field}
                        value="fixed"
                        checked={field.value === 'fixed'}
                      />
                      Preço Fixo
                    </label>
                  </div>
                )}
              />
            </div>

            {discountType === 'percentage' ? (
              <div>
                <Label htmlFor="discountPercentage">Percentual de Desconto (%) *</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('discountPercentage', {
                    required: 'Percentual é obrigatório',
                    min: { value: 0, message: 'Mínimo 0%' },
                    max: { value: 100, message: 'Máximo 100%' },
                  })}
                  disabled={loading}
                />
                {errors.discountPercentage && (
                  <p className="text-sm text-destructive">
                    {errors.discountPercentage.message}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="promotionalPrice">Preço Promocional (R$) *</Label>
                <Input
                  id="promotionalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('promotionalPrice', {
                    required: 'Preço promocional é obrigatório',
                    min: { value: 0, message: 'Preço deve ser maior que zero' },
                  })}
                  disabled={loading}
                />
                {errors.promotionalPrice && (
                  <p className="text-sm text-destructive">
                    {errors.promotionalPrice.message}
                  </p>
                )}
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="isActive">Ativa</Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label htmlFor="isActive" className="text-sm">
                      Promoção está ativa
                    </label>
                  </div>
                )}
              />
            </div>

            <div className="col-span-2">
              <Label>Produtos *</Label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded"
                    >
                      <Checkbox
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum produto encontrado
                    </p>
                  )}
                </div>
              </div>
              {selectedProductIds.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedProductIds.length} produto(s) selecionado(s)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
