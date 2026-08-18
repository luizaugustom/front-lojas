'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  photos: string[];
  alt: string;
  className?: string;
};

export function ProductGallery({ photos, alt, className }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!photos.length) {
    return (
      <div
        className={cn(
          'flex aspect-square items-center justify-center rounded-md bg-muted text-muted-foreground',
          className,
        )}
      >
        <Package className="h-16 w-16" aria-hidden="true" />
      </div>
    );
  }

  const active = photos[Math.min(activeIndex, photos.length - 1)];

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, idx) => (
            <button
              key={photo + idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Ver foto ${idx + 1}`}
              aria-current={idx === activeIndex}
              className={cn(
                'h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition',
                idx === activeIndex
                  ? 'border-primary'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
