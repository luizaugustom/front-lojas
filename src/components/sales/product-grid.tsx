'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductImage } from '@/components/products/product-image';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export function ProductGrid({ products, isLoading, onAddToCart }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-2">
            <CardHeader>
              <div className="h-3 w-16 sm:h-4 sm:w-20 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-10 sm:h-5 sm:w-12 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <div className="p-4 sm:p-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col p-2">
          <CardHeader className="pb-1">
            <div className="flex items-start gap-2">
              <ProductImage 
                photos={product.photos} 
                name={product.name} 
                size="sm"
                className="flex-shrink-0"
              />
              <CardTitle className="text-sm line-clamp-2 flex-1">{product.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 py-1">
            <div className="space-y-1">
              <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
              <p className="text-xs text-muted-foreground">
                Estoque: {product.stockQuantity}
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-1">
            <Button
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onAddToCart(product, 1)}
              disabled={product.stockQuantity <= 0}
              aria-label={`Adicionar ${product.name}`}
              title={`Adicionar ${product.name}`}
            >
              <Plus className="h-4 w-4 text-blue-600" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
