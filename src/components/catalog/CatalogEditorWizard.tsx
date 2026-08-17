'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  useCatalogConfig,
  useUpdateCatalogConfig,
} from '@/hooks/useCatalogConfig';
import { useCatalogEditorStore } from '@/store/catalog-editor-store';
import { TemplateStep } from './wizard/TemplateStep';
import { TextsStep } from './wizard/TextsStep';
import { ColorsStep } from './wizard/ColorsStep';

const STEPS = [
  { id: 'template' as const, label: 'Template' },
  { id: 'texts' as const, label: 'Textos' },
  { id: 'colors' as const, label: 'Cores' },
];

export function CatalogEditorWizard() {
  const router = useRouter();
  const { data, isLoading, error } = useCatalogConfig();
  const update = useUpdateCatalogConfig();
  const step = useCatalogEditorStore((s) => s.step);
  const setStep = useCatalogEditorStore((s) => s.setStep);
  const hydrate = useCatalogEditorStore((s) => s.hydrate);

  useEffect(() => {
    if (data) {
      hydrate({
        templateId: data.templateId,
        texts: data.texts,
        colors: data.colors,
        logoUrl: data.logoUrl,
        heroImageUrl: data.heroImageUrl,
        step: 'template',
        dirty: false,
      });
    }
  }, [data, hydrate]);

  if (isLoading) return <p>Carregando...</p>;
  if (error || !data) return <p>Não foi possível carregar o catálogo.</p>;

  const currentIndex = STEPS.findIndex((s) => s.id === step);
  const isLast = currentIndex === STEPS.length - 1;
  const isFirst = currentIndex === 0;

  async function handleNext() {
    const snapshot = useCatalogEditorStore.getState();
    try {
      await update.mutateAsync({
        templateId: snapshot.templateId,
        texts: snapshot.texts,
      });
      if (isLast) {
        toast.success('Catálogo salvo!');
        router.push('/settings/catalogo');
      } else {
        setStep(STEPS[currentIndex + 1].id);
      }
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <ol
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 32,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 8,
              borderRadius: 6,
              background: i === currentIndex ? '#2563eb' : '#f1f5f9',
              color: i === currentIndex ? '#fff' : '#64748b',
            }}
          >
            {i + 1}. {s.label}
          </li>
        ))}
      </ol>

      <div
        style={{
          background: '#fff',
          padding: 32,
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        {step === 'template' && <TemplateStep />}
        {step === 'texts' && <TextsStep />}
        {step === 'colors' && <ColorsStep />}
      </div>

      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={() => setStep(STEPS[currentIndex - 1].id)}
          disabled={isFirst}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            background: '#fff',
            cursor: isFirst ? 'not-allowed' : 'pointer',
            opacity: isFirst ? 0.5 : 1,
          }}
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={update.isPending}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            cursor: update.isPending ? 'wait' : 'pointer',
            opacity: update.isPending ? 0.7 : 1,
          }}
        >
          {isLast ? 'Salvar e publicar' : 'Avançar'}
        </button>
      </div>
    </div>
  );
}
