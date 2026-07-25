'use client';

import { ReactNode } from 'react';

interface PropertiesPanelProps {
  tab: 'properties' | 'theme';
  onTabChange: (t: 'properties' | 'theme') => void;
  properties: ReactNode;
  theme: ReactNode;
}

/**
 * Painel direito com duas abas: Propriedades (do bloco selecionado)
 * e Tema. Mantém estado da aba no pai porque a UI de propriedades
 * muda conforme a seleção.
 */
export function PropertiesPanel({ tab, onTabChange, properties, theme }: PropertiesPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b">
        <TabButton active={tab === 'properties'} onClick={() => onTabChange('properties')}>
          Propriedades
        </TabButton>
        <TabButton active={tab === 'theme'} onClick={() => onTabChange('theme')}>
          Tema
        </TabButton>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {tab === 'properties' ? properties : theme}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
