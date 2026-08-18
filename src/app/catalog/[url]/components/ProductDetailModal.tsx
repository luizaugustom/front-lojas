'use client';

import { useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublicProductDetail } from '@/hooks/useBasicCatalog';
import { usePublicCartStore } from '@/store/public-cart-store';

import { ProductGallery } from './ProductGallery';
import { QuantitySelector } from './QuantitySelector';

type Props = {
  url: string;
  productId: string | undefined;
  onClose: () => void;
  brandColor?: string | null;
};

const formatPrice = (value: string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));

export function ProductDetailModal({
  url,
  productId,
  onClose,
  brandColor,
}: Props) {
  const open = !!productId;
  const { data, isLoading, isError, error, refetch } = usePublicProductDetail(
    url,
    productId,
  );
  const addToCart = usePublicCartStore((s) => s.addWithQuantity);
  const [quantity, setQuantity] = useState(1);

  // Resetar quantidade quando o produto aberto muda.
  useEffect(() => {
    setQuantity(1);
  }, [productId]);

  const isOutOfStock = !!data && data.stockQuantity <= 0;

  const handleAdd = () => {
    if (!data) return;
    addToCart(
      {
        productId: data.id,
        name: data.name,
        price: Number(data.price),
        imageUrl: data.photos[0] ?? null,
        maxStock: data.stockQuantity,
      },
      quantity,
    );
    // futura melhoria: mostrar toast de "adicionado"
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        {isLoading && (
          <div className="flex items-center justify-center p-16">
            <Loader2
              className="h-8 w-8 animate-spin text-muted-foreground"
              aria-hidden
            />
            <span className="sr-only">Carregando produto…</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground" aria-hidden />
            <DialogHeader>
              <DialogTitle>Produto indisponível</DialogTitle>
              <DialogDescription>
                {error instanceof Error
                  ? error.message
                  : 'Não foi possível carregar este produto.'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}

        {data && (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
            <ProductGallery photos={data.photos} alt={data.name} />

            <div className="flex flex-col gap-3">
              {data.category && (
                <Badge variant="secondary" className="w-fit">
                  {data.category}
                </Badge>
              )}

              <DialogHeader>
                <DialogTitle className="text-xl">{data.name}</DialogTitle>
                {data.size && (
                  <DialogDescription>Tamanho: {data.size}</DialogDescription>
                )}
              </DialogHeader>

              <div className="flex items-baseline gap-2">
                <span
                  className="text-2xl font-bold"
                  style={brandColor ? { color: brandColor } : undefined}
                >
                  {formatPrice(data.price)}
                </span>
              </div>

              {data.description && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {data.description}
                </p>
              )}

              <div className="mt-auto flex items-center gap-3 pt-4">
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={data.stockQuantity}
                />
                <Button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className="flex-1"
                  style={
                    brandColor ? { backgroundColor: brandColor } : undefined
                  }
                >
                  {isOutOfStock ? 'Esgotado' : 'Adicionar ao carrinho'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
