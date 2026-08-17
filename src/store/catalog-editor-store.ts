'use client';

import { create } from 'zustand';
import type {
  CatalogTemplateId,
  CatalogTexts,
  CatalogColors,
} from '@/lib/storefront-types';

export type WizardStep = 'template' | 'texts' | 'colors';

export const DEFAULT_TEXTS: CatalogTexts = {
  heroTitle: 'Bem-vindo',
  heroSubtitle: 'Confira nossos produtos',
  aboutTitle: 'Sobre nós',
  aboutBody: '',
  contactPhone: '',
  contactEmail: '',
  footerText: '',
};

export const DEFAULT_COLORS: CatalogColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#f59e0b',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

type CatalogEditorState = {
  step: WizardStep;
  templateId: CatalogTemplateId;
  texts: CatalogTexts;
  colors: CatalogColors;
  logoUrl: string | null;
  heroImageUrl: string | null;
  dirty: boolean;

  setStep: (step: WizardStep) => void;
  setTemplate: (id: CatalogTemplateId) => void;
  setText: (key: keyof CatalogTexts, value: string) => void;
  setColor: (key: keyof CatalogColors, value: string) => void;
  setLogoUrl: (url: string | null) => void;
  setHeroImageUrl: (url: string | null) => void;
  hydrate: (initial: Partial<CatalogEditorState>) => void;
  reset: () => void;
};

export const useCatalogEditorStore = create<CatalogEditorState>((set) => ({
  step: 'template',
  templateId: 'CLASSIC',
  texts: { ...DEFAULT_TEXTS },
  colors: { ...DEFAULT_COLORS },
  logoUrl: null,
  heroImageUrl: null,
  dirty: false,

  setStep: (step) => set({ step }),
  setTemplate: (id) => set({ templateId: id, dirty: true }),
  setText: (key, value) =>
    set((s) => ({ texts: { ...s.texts, [key]: value }, dirty: true })),
  setColor: (key, value) =>
    set((s) => ({ colors: { ...s.colors, [key]: value }, dirty: true })),
  setLogoUrl: (url) => set({ logoUrl: url, dirty: true }),
  setHeroImageUrl: (url) => set({ heroImageUrl: url, dirty: true }),
  hydrate: (initial) => set((s) => ({ ...s, ...initial, dirty: false })),
  reset: () =>
    set({
      step: 'template',
      templateId: 'CLASSIC',
      texts: { ...DEFAULT_TEXTS },
      colors: { ...DEFAULT_COLORS },
      logoUrl: null,
      heroImageUrl: null,
      dirty: false,
    }),
}));
