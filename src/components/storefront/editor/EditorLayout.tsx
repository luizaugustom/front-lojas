'use client';

import { ReactNode } from 'react';

interface EditorLayoutProps {
  toolbar: ReactNode;
  palette: ReactNode;
  canvas: ReactNode;
  panel: ReactNode;
}

/**
 * Layout 3 colunas do editor visual:
 *  - Topo: Toolbar (salvar, publicar, undo/redo)
 *  - Esquerda: BlockPalette
 *  - Centro: Canvas
 *  - Direita: PropertiesPanel / ThemePanel
 *
 * O canvas tem largura flexível; palette e panel têm largura fixa.
 * Em telas pequenas (< 1280px), os painéis viram gavetas.
 */
export function EditorLayout({ toolbar, palette, canvas, panel }: EditorLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <div className="shrink-0 border-b bg-white z-10">{toolbar}</div>

      <div className="flex-1 flex min-h-0">
        <aside className="w-64 shrink-0 border-r bg-white overflow-y-auto">{palette}</aside>

        <main className="flex-1 overflow-y-auto bg-gray-100">{canvas}</main>

        <aside className="w-80 shrink-0 border-l bg-white overflow-y-auto">{panel}</aside>
      </div>
    </div>
  );
}
