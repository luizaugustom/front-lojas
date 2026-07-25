'use client';

import { useState } from 'react';
import { Copy, Check, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
}

/**
 * Bloco de cupom: mostra código, descrição e data de expiração com
 * botão de copiar. Suporta `highlight` (fundo destacado com a cor primária).
 */
export function CouponBlock({ block }: Props) {
  const {
    code = '',
    description = '',
    expiresAt = null,
    highlight = true,
  } = block.props || {};

  const [copied, setCopied] = useState(false);

  function copy() {
    if (!code) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(
        () => {
          setCopied(true);
          toast.success('Cupom copiado!');
          setTimeout(() => setCopied(false), 1800);
        },
        () => toast.error('Não foi possível copiar'),
      );
    }
  }

  const expired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <section
      className="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl"
      style={{
        marginTop: 'var(--sf-section-spacing)',
        marginBottom: 'var(--sf-section-spacing)',
      }}
    >
      <div
        className="border-2 border-dashed rounded-md p-5 flex flex-col sm:flex-row items-center gap-4"
        style={{
          borderColor: highlight ? 'var(--sf-primary)' : 'var(--sf-border)',
          backgroundColor: highlight ? 'var(--sf-primary)' : 'transparent',
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-full"
            style={{
              backgroundColor: highlight ? 'rgba(255,255,255,0.2)' : 'var(--sf-surface)',
              color: highlight ? '#fff' : 'var(--sf-primary)',
            }}
          >
            <Ticket className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            {description && (
              <p
                className="text-sm font-medium truncate"
                style={{ color: highlight ? '#fff' : 'var(--sf-text)' }}
              >
                {description}
              </p>
            )}
            {expiresAt && (
              <p
                className="text-xs mt-0.5"
                style={{
                  color: highlight ? 'rgba(255,255,255,0.8)' : 'var(--sf-text-muted)',
                }}
              >
                {expired
                  ? `Expirou em ${new Date(expiresAt).toLocaleDateString('pt-BR')}`
                  : `Válido até ${new Date(expiresAt).toLocaleDateString('pt-BR')}`}
              </p>
            )}
          </div>
        </div>

        {code && (
          <button
            onClick={copy}
            disabled={expired}
            className="flex items-center gap-2 px-4 py-2 font-mono font-bold text-sm rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: highlight ? '#fff' : 'var(--sf-primary)',
              color: highlight ? 'var(--sf-primary)' : '#fff',
              borderRadius: 'var(--sf-radius)',
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {code}
          </button>
        )}
      </div>
    </section>
  );
}
