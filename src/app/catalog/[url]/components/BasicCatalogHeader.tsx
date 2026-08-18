'use client';

import { Phone } from 'lucide-react';
import type { BasicCatalogCompany } from '@/hooks/useBasicCatalog';

type Props = {
  company: BasicCatalogCompany;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function BasicCatalogHeader({ company }: Props) {
  const displayName = company.fantasyName?.trim() || company.name;
  const phoneDigits = (company.phone ?? '').replace(/\D/g, '');

  return (
    <header
      className="sticky top-0 z-30 w-full border-b border-slate-200 shadow-sm"
      style={{
        backgroundColor: 'var(--catalog-header-bg)',
        color: 'var(--catalog-header-text)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 md:h-14 md:w-14">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-base font-semibold opacity-70 md:text-lg">
              {getInitials(displayName)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold md:text-xl">
            {displayName}
          </h1>
          {company.phone ? (
            <a
              href={phoneDigits ? `tel:+55${phoneDigits}` : undefined}
              className="mt-0.5 inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100 md:text-base"
            >
              <Phone className="h-4 w-4" aria-hidden />
              <span>{company.phone}</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}