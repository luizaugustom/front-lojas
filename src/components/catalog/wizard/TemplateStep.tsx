'use client';

import { useCatalogEditorStore } from '@/store/catalog-editor-store';
import type { CatalogTemplateId } from '@/lib/storefront-types';

const TEMPLATES: Array<{ id: CatalogTemplateId; name: string; description: string }> = [
  { id: 'CLASSIC', name: 'Clássico', description: 'Estilo tradicional com serifas e tons suaves.' },
  { id: 'MODERN', name: 'Moderno', description: 'Layout split, minimalista, paleta neutra.' },
  { id: 'BOLD', name: 'Bold', description: 'Hero full-width com gradiente, tipografia forte.' },
];

export function TemplateStep() {
  const templateId = useCatalogEditorStore((s) => s.templateId);
  const setTemplate = useCatalogEditorStore((s) => s.setTemplate);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}
    >
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTemplate(t.id)}
          style={{
            padding: 24,
            border: templateId === t.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
            borderRadius: 8,
            background: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <h3 style={{ margin: 0 }}>{t.name}</h3>
          <p style={{ marginTop: 8, fontSize: 14, color: '#64748b' }}>
            {t.description}
          </p>
        </button>
      ))}
    </div>
  );
}
