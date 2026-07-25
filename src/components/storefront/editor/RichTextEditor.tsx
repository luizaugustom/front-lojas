'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Quote,
} from 'lucide-react';

/**
 * Editor rich-text leve baseado em contentEditable + execCommand.
 * Sem dependência externa (Tiptap/Quill) — usa comandos nativos do
 * navegador. Suficiente para os blocos de texto/about do storefront.
 *
 * Saída: HTML simples e sanitizado por `sanitizeHtml` antes de
 * renderizar no renderer público.
 */
interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const lastValueRef = useRef(value);

  // Inicializa conteúdo uma vez
  useEffect(() => {
    if (!ref.current) return;
    if (lastValueRef.current !== value) {
      ref.current.innerHTML = value || '';
      lastValueRef.current = value;
    }
  }, [value]);

  function emit() {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastValueRef.current = html;
    onChange(html);
  }

  function exec(command: string, arg?: string) {
    if (typeof document === 'undefined') return;
    ref.current?.focus();
    document.execCommand(command, false, arg);
    updateActiveState();
    emit();
  }

  function updateActiveState() {
    if (typeof document === 'undefined') return;
    const sel = document.getSelection();
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      ul: document.queryCommandState('insertUnorderedList'),
      ol: document.queryCommandState('insertOrderedList'),
    });
  }

  function insertLink() {
    const url = window.prompt('URL do link:');
    if (!url) return;
    exec('createLink', url);
    // Garante rel seguro em todos os links do editor
    if (ref.current) {
      const links = ref.current.querySelectorAll('a');
      links.forEach((a) => {
        a.setAttribute('rel', 'noopener noreferrer');
        if (a.getAttribute('href')?.startsWith('http')) {
          a.setAttribute('target', '_blank');
        }
      });
      emit();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    // Força texto puro no paste para evitar HTML de Word/Pages
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  const isActive = (key: string) => Boolean(activeFormats[key]);

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center gap-0.5 p-1 bg-gray-50 border-b flex-wrap">
        <ToolbarBtn label="Negrito" active={isActive('bold')} onClick={() => exec('bold')}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Itálico" active={isActive('italic')} onClick={() => exec('italic')}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          label="Sublinhado"
          active={isActive('underline')}
          onClick={() => exec('underline')}
        >
          <Underline className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <Sep />
        <ToolbarBtn label="Título 2" onClick={() => exec('formatBlock', '<h2>')}>
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Título 3" onClick={() => exec('formatBlock', '<h3>')}>
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <Sep />
        <ToolbarBtn
          label="Lista"
          active={isActive('ul')}
          onClick={() => exec('insertUnorderedList')}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          label="Lista numerada"
          active={isActive('ol')}
          onClick={() => exec('insertOrderedList')}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <Sep />
        <ToolbarBtn label="Citação" onClick={() => exec('formatBlock', '<blockquote>')}>
          <Quote className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Link" onClick={insertLink}>
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onKeyUp={updateActiveState}
        onMouseUp={updateActiveState}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="min-h-[120px] max-h-[300px] overflow-y-auto p-2 text-sm focus:outline-none prose prose-sm max-w-none [&_p]:my-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-blue-600 [&_a]:underline [&_p:empty]:before:content-[attr(data-placeholder)] [&_p:empty]:before:text-gray-400"
        style={{ outline: 'none' }}
      />
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // não tira o foco do editor
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-1.5 rounded hover:bg-gray-200 ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-gray-300 mx-0.5" />;
}
