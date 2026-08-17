'use client';

import { useCatalogEditorStore } from '@/store/catalog-editor-store';
import type { CatalogColors } from '@/lib/storefront-types';

const TOKENS: Array<{ key: keyof CatalogColors; label: string }> = [
  { key: 'primary', label: 'Primária' },
  { key: 'secondary', label: 'Secundária' },
  { key: 'accent', label: 'Destaque' },
  { key: 'background', label: 'Fundo' },
  { key: 'surface', label: 'Superfície' },
  { key: 'text', label: 'Texto' },
  { key: 'textMuted', label: 'Texto secundário' },
  { key: 'border', label: 'Borda' },
];

const HEX_REGEX = /^#[0-9a-fA-F]{3,8}$/;

export function ColorsStep() {
  const colors = useCatalogEditorStore((s) => s.colors);
  const setColor = useCatalogEditorStore((s) => s.setColor);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
      }}
    >
      {TOKENS.map((t) => {
        const value = colors[t.key] || '#000000';
        const valid = HEX_REGEX.test(value);
        return (
          <label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={valid ? value : '#000000'}
              onChange={(e) => setColor(t.key, e.target.value)}
              style={{
                width: 40,
                height: 40,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</div>
              <input
                type="text"
                value={value}
                onChange={(e) => setColor(t.key, e.target.value)}
                style={{
                  width: 90,
                  fontSize: 12,
                  padding: 4,
                  border: '1px solid #cbd5e1',
                  borderRadius: 4,
                }}
              />
            </div>
          </label>
        );
      })}
    </div>
  );
}
