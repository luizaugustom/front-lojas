'use client';

import { useCatalogEditorStore } from '@/store/catalog-editor-store';
import type { CatalogTexts } from '@/lib/storefront-types';

const FIELDS: Array<{ key: keyof CatalogTexts; label: string; multiline?: boolean; max: number }> = [
  { key: 'heroTitle', label: 'Título do hero', max: 80 },
  { key: 'heroSubtitle', label: 'Subtítulo do hero', max: 160 },
  { key: 'aboutTitle', label: 'Título "Sobre nós"', max: 80 },
  { key: 'aboutBody', label: 'Texto "Sobre nós"', multiline: true, max: 1000 },
  { key: 'contactPhone', label: 'Telefone de contato', max: 20 },
  { key: 'contactEmail', label: 'E-mail de contato', max: 120 },
  { key: 'footerText', label: 'Texto do rodapé', max: 200 },
];

export function TextsStep() {
  const texts = useCatalogEditorStore((s) => s.texts);
  const setText = useCatalogEditorStore((s) => s.setText);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {FIELDS.map((f) => (
        <label key={f.key} style={{ display: 'block' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500 }}>{f.label}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {texts[f.key].length}/{f.max}
            </span>
          </div>
          {f.multiline ? (
            <textarea
              value={texts[f.key]}
              maxLength={f.max}
              onChange={(e) => setText(f.key, e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <input
              type="text"
              value={texts[f.key]}
              maxLength={f.max}
              onChange={(e) => setText(f.key, e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #cbd5e1',
                borderRadius: 6,
              }}
            />
          )}
        </label>
      ))}
    </div>
  );
}
