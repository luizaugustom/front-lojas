'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  photos?: string[];
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductImage({ photos, name, className, size = 'md' }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const hasValidPhotos = photos && photos.length > 0 && photos[0] && photos[0] !== 'null';

  if (!hasValidPhotos || imageError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted rounded-md border',
        sizeClasses[size],
        className
      )}>
        <Package className={cn(
          'text-muted-foreground',
          size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'
        )} />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-md border', sizeClasses[size], className)}>
      <img
        src={photos[0]}
        alt={name}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-200',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Package className={cn(
            'text-muted-foreground animate-pulse',
            size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'
          )} />
        </div>
      )}
    </div>
  );
}

