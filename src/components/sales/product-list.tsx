"use client";

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductImage } from '@/components/products/product-image';
import { ImageViewer } from '@/components/ui/image-viewer';
import { formatCurrency } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';
import type { Product } from '@/types';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export function ProductList({ products, isLoading, onAddToCart }: ProductListProps) {
  const [selectedImage, setSelectedImage] = useState<{ images: string[], index: number } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [totalItems]);

  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  const handleImageClick = (product: Product) => {
    if (product.photos && product.photos.length > 0) {
      const validImages = product.photos
        .map(photo => getImageUrl(photo))
        .filter(Boolean);
      
      if (validImages.length > 0) {
        setSelectedImage({ images: validImages, index: 0 });
      }
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-1">
            <CardContent className="flex items-center gap-3 py-2">
              <div className="h-10 w-10 rounded bg-muted animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="mt-0.5 h-3 w-24 rounded bg-muted animate-pulse" />
              </div>
              <div className="w-7">
                <div className="h-7 w-full rounded bg-muted animate-pulse" />
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
      <>
        <div className="space-y-1">
          {paginatedProducts.map((product) => (
            <Card key={product.id} className="p-1">
              <CardContent className="flex items-center gap-3 py-2">
                <ProductImage 
                  photos={product.photos} 
                  name={product.name} 
                  size="md"
                  className="flex-none"
                  onClick={() => handleImageClick(product)}
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
                    <Plus className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          totalItems={totalItems}
        />

        {selectedImage && (
          <ImageViewer
            open={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            images={selectedImage.images}
            initialIndex={selectedImage.index}
            alt="Imagem do produto"
          />
        )}
      </>
    );
}
