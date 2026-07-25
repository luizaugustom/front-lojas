'use client';

import { StorefrontTheme } from '@/lib/storefront-types';

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

/**
 * Aba "Tema" do editor. Permite ajustar cores, fontes, raio e
 * espaçamento. Mudanças aplicam em tempo real no canvas via CSS vars.
 *
 * Fase 5 vai adicionar preview responsivo e validação Zod nos tokens.
 */
export function ThemePanel({ theme, onUpdate }: ThemePanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-sm mb-3">Cores</h3>
        <div className="space-y-2">
          {COLOR_TOKENS.map((token) => (
            <ColorRow
              key={token.key}
              value={theme.colors[token.key]}
              label={token.label}
              hint={token.hint}
              onChange={(value) =>
                onUpdate({ colors: { [token.key]: value } } as any)
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
