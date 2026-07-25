'use client';

import Image from 'next/image';
import { Phone } from 'lucide-react';
import { Block } from '@/lib/storefront-types';
import { useStorefrontData } from '../../StorefrontDataContext';
import { getImageUrl } from '@/lib/image-utils';

interface Props {
  block: Block;
}

/**
 * Cabeçalho da página. Mostra logo + nome da empresa + telefone.
 * Variante `transparent` deixa o fundo transparente (útil para sobrepor
 * em hero). A estilização principal vem do tema (cores via CSS vars).
 */
export function HeaderBlock({ block }: Props) {
  const {
    showLogo = true,
    showName = true,
    showPhone = true,
    transparent = false,
  } = block.props || {};

  const { company } = useStorefrontData();

  if (!company) return null;
  const displayName =
    (company.fantasyName && String(company.fantasyName).trim()) ||
    company.name ||
    'Empresa';

  return (
    <header
      className={`w-full ${transparent ? '' : 'border-b'}`}
      style={{
        backgroundColor: transparent ? 'transparent' : 'var(--sf-surface)',
        borderColor: transparent ? 'transparent' : 'var(--sf-border)',
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showLogo && company.logoUrl && (
            <div className="relative h-9 w-9 flex-shrink-0">
              <Image
                src={getImageUrl(company.logoUrl)}
                alt={displayName}
                fill
                className="object-contain"
                sizes="36px"
              />
            </div>
          )}
          {showName && (
            <span
              className="font-semibold text-base truncate"
              style={{
                color: transparent ? '#fff' : 'var(--sf-text)',
                fontFamily: 'var(--sf-font-heading)',
              }}
            >
              {displayName}
            </span>
          )}
        </div>

        {showPhone && company.phone && (
          <a
            href={`tel:${company.phone}`}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: transparent ? '#fff' : 'var(--sf-primary)' }}
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">{company.phone}</span>
          </a>
        )}
      </div>
    </header>
  );
}
