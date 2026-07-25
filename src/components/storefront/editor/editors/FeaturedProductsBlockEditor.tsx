'use client';

import { useEffect, useState } from 'react';
import { Block } from '@/lib/storefront-types';
import { X } from 'lucide-react';
import { productApi } from '@/lib/api-endpoints';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

const COL_OPTIONS = [2, 3, 4, 5, 6] as const;

export function FeaturedProductsBlockEditor({ block, onUpdate }: Props) {
  const { title = '', productIds = [], columns = 4 } = block.props || {};
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await productApi.list({ limit: 200 });
        const items = (res.data?.data || res.data || []) as any[];
        setAllProducts(items);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = productIds
    .map((id: string) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as any[];

  const filteredAvailable = allProducts
    .filter((p) => !productIds.includes(p.id))
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 30);

  function add(id: string) {
    if (productIds.includes(id)) return;
    onUpdate({ productIds: [...productIds, id] });
  }

  function remove(id: string) {
    onUpdate({ productIds: productIds.filter((x: string) => x !== id) });
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

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Colunas</label>
        <div className="grid grid-cols-5 gap-1">
          {COL_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => onUpdate({ columns: n })}
              className={`px-2 py-1.5 text-xs border rounded ${
                columns === n ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Produtos selecionados ({selected.length})
        </label>
        {selected.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Nenhum produto. Adicione abaixo.</p>
        ) : (
          <ul className="space-y-1 mb-2">
            {selected.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-2 py-1.5 text-xs"
              >
                <span className="truncate flex-1">{p.name}</span>
                <button
                  onClick={() => remove(p.id)}
                  className="ml-2 text-red-500 hover:text-red-700 p-0.5"
                  aria-label="Remover"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto para adicionar..."
          className="w-full text-sm px-2 py-1.5 border rounded-md"
        />
        <div className="mt-2 max-h-40 overflow-y-auto border rounded">
          {loading ? (
            <p className="text-xs text-gray-400 p-2">Carregando...</p>
          ) : filteredAvailable.length === 0 ? (
            <p className="text-xs text-gray-400 p-2">Nenhum produto disponível.</p>
          ) : (
            filteredAvailable.map((p) => (
              <button
                key={p.id}
                onClick={() => add(p.id)}
                className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 border-b last:border-b-0"
              >
                {p.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
