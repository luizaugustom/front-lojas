'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type SortKey = 'name-asc' | 'price-asc' | 'price-desc';

type CatalogQueryStateApi = {
  // Valores lidos da URL
  search: string;
  debouncedSearch: string;
  category: string | undefined;
  minPrice: string;
  maxPrice: string;
  sort: SortKey;
  page: number;
  productId: string | undefined;

  // Setters
  setSearch: (v: string) => void;
  setCategory: (v: string | undefined) => void;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  setSort: (v: SortKey) => void;
  setPage: (v: number) => void;
  openProduct: (id: string) => void;
  closeProduct: () => void;
  resetFilters: () => void;

  // Utilitários
  isPending: boolean;
};

const DEFAULT_SORT: SortKey = 'name-asc';
const SEARCH_DEBOUNCE_MS = 300;

const SORT_KEYS: ReadonlyArray<SortKey> = [
  'name-asc',
  'price-asc',
  'price-desc',
];

const isSortKey = (value: string | null): value is SortKey =>
  value !== null && (SORT_KEYS as readonly string[]).includes(value);

export function useCatalogQueryState(): CatalogQueryStateApi {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ── search ──────────────────────────────────────────────────────────────
  // rawSearch: o que o input mostra (atualiza a cada tecla).
  // debouncedSearch: o que vai pra URL e dispara o fetch (300ms depois).
  const initialSearch = searchParams.get('search') ?? '';
  const [rawSearch, setRawSearch] = useState<string>(initialSearch);

  // Sincroniza rawSearch com a URL quando ela muda externamente
  // (back/forward, troca de filtro, deep link).
  const urlSearch = searchParams.get('search') ?? '';
  useEffect(() => {
    setRawSearch(urlSearch);
  }, [urlSearch]);

  // Debounce: escreve rawSearch na URL após 300ms.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (rawSearch === urlSearch) return;
      updateParams({ search: rawSearch || null, page: '1' });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawSearch]);

  const debouncedSearch = urlSearch;

  // ── outros valores da URL ───────────────────────────────────────────────
  const productId = searchParams.get('product') ?? undefined;
  const category = searchParams.get('category') || undefined;
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sort: SortKey = isSortKey(searchParams.get('sort'))
    ? (searchParams.get('sort') as SortKey)
    : DEFAULT_SORT;
  const page = Number(searchParams.get('page') ?? '1') || 1;

  // ── helper interno ──────────────────────────────────────────────────────
  function updateParams(
    updates: Record<string, string | null>,
    options: {
      mode?: 'replace' | 'push';
      closeProduct?: boolean;
    } = {},
  ) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    if (options.closeProduct !== false) {
      params.delete('product');
    }
    const qs = params.toString();
    const url = `${pathname}${qs ? `?${qs}` : ''}`;

    startTransition(() => {
      if (options.mode === 'push') {
        router.push(url, { scroll: false });
      } else {
        router.replace(url, { scroll: false });
      }
    });
  }

  // ── setters públicos ────────────────────────────────────────────────────
  const setSearch = useCallback((value: string) => {
    setRawSearch(value);
  }, []);

  const setCategory = useCallback(
    (value: string | undefined) => {
      updateParams({ category: value ?? null, page: '1' });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, pathname],
  );

  const setMinPrice = useCallback(
    (value: string) => {
      updateParams({ minPrice: value || null, page: '1' });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, pathname],
  );

  const setMaxPrice = useCallback(
    (value: string) => {
      updateParams({ maxPrice: value || null, page: '1' });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, pathname],
  );

  const setSort = useCallback(
    (value: SortKey) => {
      updateParams({
        sort: value === DEFAULT_SORT ? null : value,
        page: '1',
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, pathname],
  );

  const setPage = useCallback(
    (value: number) => {
      updateParams(
        { page: value <= 1 ? null : String(value) },
        { closeProduct: false },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, pathname],
  );

  const openProduct = useCallback(
    (id: string) => {
      updateParams({ product: id }, { mode: 'push', closeProduct: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, pathname],
  );

  const closeProduct = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      startTransition(() => {
        router.replace(pathname, { scroll: false });
      });
    }
  }, [router, pathname]);

  const resetFilters = useCallback(() => {
    updateParams({
      search: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      sort: null,
      page: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname]);

  return useMemo(
    () => ({
      search: rawSearch,
      debouncedSearch,
      category,
      minPrice,
      maxPrice,
      sort,
      page,
      productId,
      setSearch,
      setCategory,
      setMinPrice,
      setMaxPrice,
      setSort,
      setPage,
      openProduct,
      closeProduct,
      resetFilters,
      isPending,
    }),
    [
      rawSearch,
      debouncedSearch,
      category,
      minPrice,
      maxPrice,
      sort,
      page,
      productId,
      setSearch,
      setCategory,
      setMinPrice,
      setMaxPrice,
      setSort,
      setPage,
      openProduct,
      closeProduct,
      resetFilters,
      isPending,
    ],
  );
}
