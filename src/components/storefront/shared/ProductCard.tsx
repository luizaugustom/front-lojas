'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { getImageUrl } from '@/lib/image-utils';

export interface ProductCardData {
  id: string;
  name: string;
  photos: string[];
  price: string;
  stockQuantity?: number;
  size?: string | null;
  category?: string | null;
  description?: string | null;
  unitOfMeasure?: string | null;
  originalPrice?: string;
  promotionPrice?: string;
  promotionDiscount?: number;
  isOnPromotion?: boolean;
  promotionName?: string;
}

interface ProductCardProps {
  product: ProductCardData;
  variant?: 'compact' | 'default';
  onClick?: () => void;
}

/**
 * Card de produto reutilizável para o storefront. Extraído do antigo
 * CatalogPageClient (937 linhas) e desacoplado — recebe o produto
 * como prop e dispara onClick para o pai (modal, etc).
 *
 * Variante `compact` é mais densa (3-8 colunas); `default` é mais
 * espaçosa (2-4 colunas).
 */
export function ProductCard({ product, variant = 'default', onClick }: ProductCardProps) {
  const isCompact = variant === 'compact';
  const isPromo = product.isOnPromotion;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
      style={{ borderRadius: 'var(--sf-radius)' }}
    >
      <div
        className={`relative bg-gray-100 hover:opacity-90 transition-opacity ${
          isCompact ? 'h-16' : 'aspect-square'
        }`}
      >
        {product.photos && product.photos.length > 0 ? (
          <Image
            src={getImageUrl(product.photos[0])}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Package className="h-6 w-6" />
          </div>
        )}
        {isPromo && (
          <span
            className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--sf-accent)',
              color: '#fff',
            }}
          >
            -{product.promotionDiscount}%
          </span>
        )}
      </div>

      <div className={isCompact ? 'p-1' : 'p-2'}>
        <h3
          className={`font-medium truncate ${
            isCompact ? 'text-[10px]' : 'text-sm'
          }`}
          style={{ color: 'var(--sf-text)' }}
        >
          {product.name}
        </h3>
        {product.size && !isCompact && (
          <p className="text-[10px] text-gray-500 truncate">{product.size}</p>
        )}
        <div className={`flex items-center gap-1 ${isCompact ? 'mt-0.5' : 'mt-1'}`}>
          {isPromo && product.promotionPrice ? (
            <>
              <span
                className={`font-semibold ${isCompact ? 'text-[10px]' : 'text-sm'}`}
                style={{ color: 'var(--sf-accent)' }}
              >
                R$ {Number(product.promotionPrice).toFixed(2)}
              </span>
              <span className="text-[9px] text-gray-400 line-through">
                R$ {Number(product.originalPrice || product.price).toFixed(2)}
              </span>
            </>
          ) : (
            <span
              className={`font-semibold ${isCompact ? 'text-[10px]' : 'text-sm'}`}
              style={{ color: 'var(--sf-text)' }}
            >
              R$ {Number(product.price).toFixed(2)}
            </span>
          )}
          {product.unitOfMeasure && !isCompact && (
            <span className="text-[9px] text-gray-500">/ {product.unitOfMeasure}</span>
          )}
        </div>
      </div>
    </div>
  );
}
