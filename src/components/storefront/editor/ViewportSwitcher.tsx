'use client';

import { Monitor, Tablet, Smartphone } from 'lucide-react';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

interface Props {
  value: Viewport;
  onChange: (v: Viewport) => void;
}

const OPTIONS: Array<{ value: Viewport; label: string; Icon: any; width: string }> = [
  { value: 'desktop', label: 'Desktop', Icon: Monitor, width: '100%' },
  { value: 'tablet', label: 'Tablet', Icon: Tablet, width: '768px' },
  { value: 'mobile', label: 'Celular', Icon: Smartphone, width: '375px' },
];

/**
 * Switcher de viewport (preview responsivo). Altera a largura máxima
 * do canvas no editor para simular como o storefront aparece em
 * diferentes dispositivos.
 */
export function ViewportSwitcher({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-md">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.Icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded transition ${
              active
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title={opt.label}
            aria-label={`Preview ${opt.label}`}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function viewportWidth(v: Viewport): string {
  const opt = OPTIONS.find((o) => o.value === v);
  return opt?.width || '100%';
}
