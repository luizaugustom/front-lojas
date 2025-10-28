'use client';

import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface ProductImageProps {
  photos?: string[];
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

/**
 * Componente de imagem de produto com otimização automática
 * Usa Firebase Storage URLs e lazy loading
 */
export function ProductImage({ photos, name, className, size = 'md', onClick }: ProductImageProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const sizePixels = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
  };

  // Obter primeira foto válida
  const firstPhoto = photos && photos.length > 0 ? photos[0] : null;

  // Verificar se há imagem para tornar clicável
  const hasImage = !!firstPhoto;
  const clickableClasses = hasImage && onClick 
    ? 'cursor-pointer hover:opacity-80 transition-opacity' 
    : '';

  return (
    <div 
      className={cn(clickableClasses)}
      onClick={hasImage && onClick ? onClick : undefined}
    >
      <OptimizedImage
        src={firstPhoto}
        alt={name}
        className={cn('rounded-md border', sizeClasses[size], className)}
        width={sizePixels[size].width}
        height={sizePixels[size].height}
      />
    </div>
  );
}

