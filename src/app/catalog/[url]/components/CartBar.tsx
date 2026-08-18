'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  usePublicCartStore,
  selectCartCount,
  selectCartTotal,
} from '@/store/public-cart-store';

type Props = {
  brandColor: string | null;
  onOpen: () => void;
};

const brl = (n: number): string =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function CartBar({ brandColor, onOpen }: Props) {
  const count = usePublicCartStore(selectCartCount);
  const total = usePublicCartStore(selectCartTotal);
  const accent =
    brandColor && /^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : undefined;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white shadow-lg md:sticky md:top-[72px] md:bottom-auto md:border-t-0 md:bg-transparent md:shadow-none">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:justify-end md:px-6">
        <Button
          type="button"
          onClick={onOpen}
          disabled={count === 0}
          className="w-full md:w-auto"
          style={accent ? { backgroundColor: accent, borderColor: accent } : undefined}
        >
          <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />
          {count > 0 ? (
            <>
              <span className="font-semibold">{count}</span>
              <span className="mx-2 opacity-70">•</span>
              <span>{brl(total)}</span>
            </>
          ) : (
            <span>Carrinho vazio</span>
          )}
        </Button>
      </div>
    </div>
  );
}