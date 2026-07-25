'use client';

import { Undo2, Redo2, Save, Rocket, ExternalLink } from 'lucide-react';

interface ToolbarProps {
  dirty: boolean;
  saving: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  designId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPublish: () => void;
}

/**
 * Toolbar superior do editor. Undo/Redo à esquerda, status no centro,
 * Salvar/Publicar à direita.
 */
export function Toolbar(props: ToolbarProps) {
  return (
    <div className="h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={props.onUndo}
          disabled={!props.canUndo}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Desfazer (Ctrl+Z)"
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={props.onRedo}
          disabled={!props.canRedo}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Refazer (Ctrl+Shift+Z)"
          title="Refazer (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            props.status === 'PUBLISHED'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {props.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
        </span>
        {props.dirty && (
          <span className="text-xs text-gray-500 italic">• Alterações não salvas</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <a
          href="/settings/catalogo"
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5"
        >
          ← Voltar
        </a>
        <button
          onClick={props.onSave}
          disabled={props.saving || !props.dirty}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          Salvar rascunho
        </button>
        <button
          onClick={props.onPublish}
          disabled={props.saving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Rocket className="h-4 w-4" />
          {props.saving ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  );
}
