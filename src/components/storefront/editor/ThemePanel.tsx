'use client';

import { StorefrontTheme, DEFAULT_THEME } from '@/lib/storefront-types';
import { RotateCcw } from 'lucide-react';

interface ThemePanelProps {
  theme: StorefrontTheme;
  onUpdate: (theme: Partial<StorefrontTheme>) => void;
}

const FONT_OPTIONS = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 'Lato', 'Playfair Display'];
const RADIUS_OPTIONS: Array<StorefrontTheme['borderRadius']> = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
const SPACING_OPTIONS: Array<StorefrontTheme['spacing']> = ['compact', 'normal', 'relaxed'];

const COLOR_TOKENS: Array<{ key: keyof StorefrontTheme['colors']; label: string; hint: string }> = [
  { key: 'primary', label: 'Primária', hint: 'Botões, links, destaques' },
  { key: 'secondary', label: 'Secundária', hint: 'Elementos de apoio' },
  { key: 'accent', label: 'Destaque', hint: 'Selos, promoções' },
  { key: 'background', label: 'Fundo', hint: 'Plano de fundo' },
  { key: 'surface', label: 'Superfície', hint: 'Cards, modais' },
  { key: 'text', label: 'Texto', hint: 'Cor principal do texto' },
  { key: 'textMuted', label: 'Texto secundário', hint: 'Legendas, descrições' },
  { key: 'border', label: 'Borda', hint: 'Linhas divisórias' },
];

interface PalettePreset {
  name: string;
  colors: StorefrontTheme['colors'];
}

const PALETTE_PRESETS: PalettePreset[] = [
  {
    name: 'Padrão (Azul)',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#F59E0B',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#111827',
      textMuted: '#6B7280',
      border: '#E5E7EB',
    },
  },
  {
    name: 'Esmeralda',
    colors: {
      primary: '#10B981',
      secondary: '#065F46',
      accent: '#F97316',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#111827',
      textMuted: '#6B7280',
      border: '#D1FAE5',
    },
  },
  {
    name: 'Vinho',
    colors: {
      primary: '#991B1B',
      secondary: '#7F1D1D',
      accent: '#F59E0B',
      background: '#FEF2F2',
      surface: '#FFFFFF',
      text: '#1F2937',
      textMuted: '#6B7280',
      border: '#FECACA',
    },
  },
  {
    name: 'Escuro',
    colors: {
      primary: '#60A5FA',
      secondary: '#3B82F6',
      accent: '#FBBF24',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textMuted: '#94A3B8',
      border: '#334155',
    },
  },
  {
    name: 'Pastel',
    colors: {
      primary: '#EC4899',
      secondary: '#DB2777',
      accent: '#8B5CF6',
      background: '#FDF2F8',
      surface: '#FFFFFF',
      text: '#1F2937',
      textMuted: '#6B7280',
      border: '#FBCFE8',
    },
  },
];

/**
 * Aba "Tema" do editor. Permite ajustar cores (com presets), fontes,
 * raio e espaçamento. Mudanças aplicam em tempo real no canvas via CSS vars.
 */
export function ThemePanel({ theme, onUpdate }: ThemePanelProps) {
  function resetAll() {
    if (typeof window !== 'undefined' && !window.confirm('Voltar ao tema padrão? Isso afeta todas as cores, fontes e estilos.')) {
      return;
    }
    onUpdate(DEFAULT_THEME);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Paleta</h3>
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            title="Restaurar tema padrão"
          >
            <RotateCcw className="h-3 w-3" />
            Resetar
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {PALETTE_PRESETS.map((preset) => {
            const isActive =
              preset.colors.primary === theme.colors.primary &&
              preset.colors.background === theme.colors.background;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onUpdate({ colors: preset.colors })}
                title={preset.name}
                className={`flex flex-col items-center gap-0.5 p-1 rounded border ${
                  isActive ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex w-full h-4 rounded overflow-hidden">
                  <div className="flex-1" style={{ backgroundColor: preset.colors.primary }} />
                  <div className="flex-1" style={{ backgroundColor: preset.colors.accent }} />
                  <div className="flex-1" style={{ backgroundColor: preset.colors.background }} />
                </div>
                <span className="text-[9px] text-gray-600 leading-tight">{preset.name}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {COLOR_TOKENS.map((token) => (
            <ColorRow
              key={token.key}
              value={theme.colors[token.key]}
              label={token.label}
              hint={token.hint}
              onChange={(value) =>
                onUpdate({ colors: { ...theme.colors, [token.key]: value } } as any)
              }
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-3">Fontes</h3>
        <div className="space-y-2">
          <SelectRow
            label="Títulos"
            value={theme.fonts.heading}
            options={FONT_OPTIONS}
            onChange={(value) => onUpdate({ fonts: { ...theme.fonts, heading: value } })}
          />
          <SelectRow
            label="Corpo"
            value={theme.fonts.body}
            options={FONT_OPTIONS}
            onChange={(value) => onUpdate({ fonts: { ...theme.fonts, body: value } })}
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Fontes são carregadas via Google Fonts (link injetado pela ThemeProvider).
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-3">Aparência</h3>
        <div className="space-y-2">
          <SelectRow
            label="Arredondamento"
            value={theme.borderRadius}
            options={RADIUS_OPTIONS as unknown as string[]}
            onChange={(value) => onUpdate({ borderRadius: value as StorefrontTheme['borderRadius'] })}
          />
          <SelectRow
            label="Espaçamento"
            value={theme.spacing}
            options={SPACING_OPTIONS as unknown as string[]}
            onChange={(value) => onUpdate({ spacing: value as StorefrontTheme['spacing'] })}
          />
        </div>
      </div>
    </div>
  );
}

function ColorRow({
  value,
  label,
  hint,
  onChange,
}: {
  value: string;
  label: string;
  hint: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 rounded border cursor-pointer"
        aria-label={`Cor ${label}`}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-700">{label}</div>
        <div className="text-[10px] text-gray-400">{hint}</div>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 text-xs px-1.5 py-1 border rounded font-mono"
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs px-2 py-1 border rounded bg-white"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
