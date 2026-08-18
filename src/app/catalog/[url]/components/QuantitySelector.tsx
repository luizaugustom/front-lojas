'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max: number;
};

export function QuantitySelector({ value, onChange, min = 1, max }: Props) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-md border border-input">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
        className="h-9 w-9 rounded-none rounded-l-md"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span
        aria-live="polite"
        className="min-w-[2.5rem] text-center text-sm font-medium tabular-nums"
      >
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={increment}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
        className="h-9 w-9 rounded-none rounded-r-md"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
