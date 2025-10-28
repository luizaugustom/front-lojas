'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { OptimizedImage } from './optimized-image';
import { Dialog, DialogContent } from './dialog';

interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  alt?: string;
}

/**
 * Componente de visualizador de imagens em tela cheia
 * Suporta navegação entre múltiplas imagens
 */
export function ImageViewer({ open, onClose, images, initialIndex = 0, alt = 'Imagem' }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setLoaded(false);
    }
  }, [open, initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open) return;
    
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, images.length]);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0 bg-black/95 border-none overflow-hidden" style={{ maxWidth: '95vw', maxHeight: '95vh', padding: 0 }}>
        <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: '80vh' }}>
          {/* Botão fechar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Botão anterior */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={handlePrevious}
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Imagem principal */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={currentImage}
              alt={`${alt} - ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
              onLoad={() => setLoaded(true)}
            />
          </div>

          {/* Botão próximo */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={handleNext}
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Indicador de imagens */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 rounded-md border-2 transition-all ${
                    currentIndex === index ? 'border-white' : 'border-white/30 hover:border-white/50'
                  }`}
                  aria-label={`Ir para imagem ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${alt} - Thumbnail ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
