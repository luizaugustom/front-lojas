'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Block } from '@/lib/storefront-types';
import { TestimonialItem } from '../../blocks/marketing/TestimonialsBlock';
import { ImagePicker } from '../ImagePicker';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

function newItem(): TestimonialItem {
  return { name: '', text: '', avatarUrl: '', rating: 5 };
}

/**
 * Editor do bloco de depoimentos. Lista dinâmica de itens com
 * nome, texto, avatar e avaliação (0-5).
 */
export function TestimonialsBlockEditor({ block, onUpdate }: Props) {
  const { title = 'O que dizem nossos clientes', items = [] } = block.props || {};

  function setItems(next: TestimonialItem[]) {
    onUpdate({ items: next });
  }

  function update(idx: number, patch: Partial<TestimonialItem>) {
    const next = items.map((it: TestimonialItem, i: number) =>
      i === idx ? { ...it, ...patch } : it,
    );
    setItems(next);
  }

  function add() {
    setItems([...items, newItem()]);
  }

  function remove(idx: number) {
    setItems(items.filter((_: any, i: number) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Título da seção</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">
          Depoimentos ({items.length})
        </label>
        <button
          type="button"
          onClick={add}
          className="text-xs flex items-center gap-1 px-2 py-1 border rounded hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            Nenhum depoimento. Clique em "Adicionar" para começar.
          </p>
        )}

        {items.map((item: TestimonialItem, idx: number) => (
          <div
            key={idx}
            className="border rounded-md p-3 space-y-2 bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">#{idx + 1}</span>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remover"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => update(idx, { name: e.target.value })}
              placeholder="Nome do cliente"
              className="w-full text-xs px-2 py-1.5 border rounded-md"
            />

            <textarea
              value={item.text || ''}
              onChange={(e) => update(idx, { text: e.target.value })}
              placeholder="Texto do depoimento"
              rows={2}
              className="w-full text-xs px-2 py-1.5 border rounded-md resize-y"
            />

            <div>
              <label className="block text-xs text-gray-600 mb-1">Avaliação (0-5)</label>
              <input
                type="number"
                min={0}
                max={5}
                value={item.rating ?? 5}
                onChange={(e) =>
                  update(idx, {
                    rating: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
                  })
                }
                className="w-20 text-xs px-2 py-1.5 border rounded-md"
              />
            </div>

            <ImagePicker
              label="Foto (opcional)"
              value={item.avatarUrl || ''}
              onChange={(url) => update(idx, { avatarUrl: url })}
              aspect="square"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
