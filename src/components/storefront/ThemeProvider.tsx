'use client';

import { useEffect } from 'react';
import { StorefrontTheme, DEFAULT_THEME } from '@/lib/storefront-types';

interface ThemeProviderProps {
  theme?: StorefrontTheme;
  children: React.ReactNode;
}

const GOOGLE_FONTS_HOST = 'https://fonts.googleapis.com/css2';

/**
 * Injeta os tokens do tema (cores, fontes, radius, spacing) como CSS
 * custom properties no `:root`. Os renderers dos blocos usam essas vars
 * (`var(--sf-primary)`, etc.) para se adequar ao tema da empresa.
 *
 * Carrega dinamicamente os links de Google Fonts para as fontes
 * escolhidas pelo admin (heading + body) e os remove ao desmontar.
 *
 * Componentes do storefront devem usar SEMPRE essas vars em vez de
 * cores hard-coded — assim o tema da empresa se propaga sem mudanças.
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const merged: StorefrontTheme = theme || DEFAULT_THEME;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Cores
    root.style.setProperty('--sf-primary', merged.colors.primary);
    root.style.setProperty('--sf-secondary', merged.colors.secondary);
    root.style.setProperty('--sf-accent', merged.colors.accent);
    root.style.setProperty('--sf-background', merged.colors.background);
    root.style.setProperty('--sf-surface', merged.colors.surface);
    root.style.setProperty('--sf-text', merged.colors.text);
    root.style.setProperty('--sf-text-muted', merged.colors.textMuted);
    root.style.setProperty('--sf-border', merged.colors.border);

    // Fontes
    root.style.setProperty('--sf-font-heading', `"${merged.fonts.heading}", system-ui, sans-serif`);
    root.style.setProperty('--sf-font-body', `"${merged.fonts.body}", system-ui, sans-serif`);

    // Border radius
    const radiusMap: Record<StorefrontTheme['borderRadius'], string> = {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    };
    root.style.setProperty('--sf-radius', radiusMap[merged.borderRadius]);

    // Spacing scale
    const spacingMap: Record<StorefrontTheme['spacing'], string> = {
      compact: '0.75rem',
      normal: '1.5rem',
      relaxed: '2.5rem',
    };
    root.style.setProperty('--sf-section-spacing', spacingMap[merged.spacing]);

    // Carrega Google Fonts dinamicamente para as fontes usadas
    const fonts = Array.from(new Set([merged.fonts.heading, merged.fonts.body]));
    const linkHref = `${GOOGLE_FONTS_HOST}?family=${fonts
      .map((f) => f.replace(/ /g, '+') + ':wght@400;500;600;700')
      .join('&family=')}&display=swap`;
    const linkId = 'sf-google-fonts';
    let linkEl = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.id = linkId;
      linkEl.rel = 'stylesheet';
      document.head.appendChild(linkEl);
    }
    linkEl.href = linkHref;

    return () => {
      // Limpa as CSS vars ao desmontar (evita vazar para outras páginas)
      [
        '--sf-primary', '--sf-secondary', '--sf-accent',
        '--sf-background', '--sf-surface', '--sf-text', '--sf-text-muted', '--sf-border',
        '--sf-font-heading', '--sf-font-body', '--sf-radius', '--sf-section-spacing',
      ].forEach((v) => root.style.removeProperty(v));

      // Não removemos o <link> de Google Fonts — múltiplos storefronts
      // podem coexistir e o browser cacheia eficientemente.
    };
  }, [merged]);

  return <>{children}</>;
}
