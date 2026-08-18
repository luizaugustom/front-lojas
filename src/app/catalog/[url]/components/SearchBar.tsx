'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <Input
        type="search"
        inputMode="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar produtos…"
        className="pl-9 pr-9"
        aria-label="Buscar produtos"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-500"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}