'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';

interface OptimizedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagem otimizado com:
 * - Lazy loading nativo
 * - Placeholder enquanto carrega
 * - Fallback em caso de erro
 * - Suporte para Firebase Storage URLs
 */
export function OptimizedImage({
  src,
  alt,
  className,
  fallbackClassName,
  width,
  height,
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setImageState('error');
      return;
    }

    const imageUrl = getImageUrl(src);
    setImageSrc(imageUrl);
    setImageState('loading');
  }, [src]);

  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    setImageState('error');
    onError?.();
  };

  // Se não há imagem ou houve erro, mostrar fallback
  if (!src || imageState === 'error') {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted rounded-md border',
          fallbackClassName || className,
        )}
        style={width && height ? { width, height } : undefined}
      >
        <Box className="text-muted-foreground h-1/2 w-1/2" />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={width && height ? { width, height } : undefined}>
      {/* Placeholder enquanto carrega */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <Box className="text-muted-foreground h-1/2 w-1/2 animate-pulse" />
        </div>
      )}

      {/* Imagem real */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
        )}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
        decoding="async"
      />
    </div>
  );
}

interface OptimizedImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  thumbnailClassName?: string;
}

/**
 * Galeria de imagens otimizada
 */
export function OptimizedImageGallery({
  images,
  alt,
  className,
  thumbnailClassName,
}: OptimizedImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-muted rounded-md border p-8', className)}>
        <Package className="text-muted-foreground h-16 w-16" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Imagem principal */}
      <OptimizedImage
        src={images[selectedIndex]}
        alt={`${alt} - Imagem ${selectedIndex + 1}`}
        className="w-full aspect-square rounded-lg border"
        priority={selectedIndex === 0}
      />

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'flex-shrink-0 rounded-md border-2 transition-all',
                selectedIndex === index ? 'border-primary' : 'border-transparent',
                thumbnailClassName,
              )}
            >
              <OptimizedImage
                src={image}
                alt={`${alt} - Thumbnail ${index + 1}`}
                className="w-16 h-16 rounded-md"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

