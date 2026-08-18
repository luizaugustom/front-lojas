'use client';

import { useEffect } from 'react';

/**
 * Força o tema claro no <html> sem gravar localStorage,
 * para o catálogo público não herdar dark do dashboard/OS.
 */
export function CatalogLightTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    return () => {
      root.classList.remove('light', 'dark');
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (saved) {
        root.classList.add(saved);
        return;
      }
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    };
  }, []);

  return null;
}
