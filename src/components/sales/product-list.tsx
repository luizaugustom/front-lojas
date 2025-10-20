"use client";

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductImage } from '@/components/products/product-image';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export function ProductList({ products, isLoading, onAddToCart }: ProductListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-2">
            <CardContent className="flex items-center gap-4">
              <div className="h-10 w-10 rounded bg-muted animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="mt-2 h-3 w-24 rounded bg-muted animate-pulse" />
              </div>
              <div className="w-16">
                <div className="h-8 w-full rounded bg-muted animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      </Card>
    );
  }

    return (
      <div className="space-y-1">
        {products.map((product) => (
          <Card key={product.id} className="p-1">
            <CardContent className="flex items-center gap-3 py-2">
              <ProductImage 
                photos={product.photos} 
                name={product.name} 
                size="md"
                className="flex-none"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <div className="text-sm font-semibold">{formatCurrency(product.price)}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Estoque: {product.stockQuantity}</p>
              </div>
                     <div className="flex-shrink-0">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
}
