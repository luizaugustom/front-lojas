'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

/**
 * Editor do bloco de cupom. `expiresAt` é uma data ISO (yyyy-mm-dd).
 */
export function CouponBlockEditor({ block, onUpdate }: Props) {
  const {
    code = '',
    description = '',
    expiresAt = '',
    highlight = true,
  } = block.props || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Código do cupom</label>
        <input
          type="text"
          value={code}
          onChange={(e) => onUpdate({ code: e.target.value.toUpperCase() })}
          placeholder="EX: BEMVINDO10"
          className="w-full text-sm px-2 py-1.5 border rounded-md font-mono uppercase"
          maxLength={32}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
        <input
          type="text"
          value={description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Ex: 10% off na primeira compra"
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Expira em</label>
        <input
          type="date"
          value={expiresAt ? String(expiresAt).slice(0, 10) : ''}
          onChange={(e) => onUpdate({ expiresAt: e.target.value || null })}
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={highlight}
          onChange={(e) => onUpdate({ highlight: e.target.checked })}
          className="rounded"
        />
        Destacar (fundo colorido)
      </label>
    </div>
  );
}
