'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

/**
 * Editor do bloco de cabeçalho. Mostra logo + nome + telefone da empresa
 * (todos opcionais). Variante `transparent` deixa o fundo transparente,
 * útil para sobrepor em um hero logo abaixo.
 */
export function HeaderBlockEditor({ block, onUpdate }: Props) {
  const {
    showLogo = true,
    showName = true,
    showPhone = true,
    transparent = false,
  } = block.props || {};

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        O cabeçalho usa o logo, nome e telefone cadastrados nos dados da empresa.
        Configure aqui o que deve aparecer.
      </p>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={showLogo}
          onChange={(e) => onUpdate({ showLogo: e.target.checked })}
          className="rounded"
        />
        Mostrar logo
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={showName}
          onChange={(e) => onUpdate({ showName: e.target.checked })}
          className="rounded"
        />
        Mostrar nome
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={showPhone}
          onChange={(e) => onUpdate({ showPhone: e.target.checked })}
          className="rounded"
        />
        Mostrar telefone
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={transparent}
          onChange={(e) => onUpdate({ transparent: e.target.checked })}
          className="rounded"
        />
        Fundo transparente (sobrepõe o bloco abaixo)
      </label>
    </div>
  );
}
