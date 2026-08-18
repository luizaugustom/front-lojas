'use client';

import { useMemo, useState } from 'react';
import {
  useBasicCatalogInfo,
  useBasicCatalogProducts,
  type BasicCatalogCompany,
  type BasicCatalogFilters,
} from '@/hooks/useBasicCatalog';
import { useCatalogQueryState } from '@/hooks/useCatalogQueryState';
import { BasicCatalogHeader } from './BasicCatalogHeader';
import { SearchBar } from './SearchBar';
import { FilterDrawer } from './FilterDrawer';
import { ProductGrid } from './ProductGrid';
import { CartBar } from './CartBar';
import { CartDrawer } from './CartDrawer';
import { CatalogFooter } from './CatalogFooter';
import { EmptyProducts } from './EmptyProducts';
import { ProductDetailModal } from './ProductDetailModal';
import {
  catalogColorsToStyle,
  mergeCatalogColors,
} from '@/lib/catalog-colors';

type Props = {
  url: string;
};

const DEFAULT_LIMIT = 24;

export function BasicCatalogView({ url }: Props) {
  const q = useCatalogQueryState();
  const {
    search,
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
  } = q;

  const [cartOpen, setCartOpen] = useState(false);

  const filters = useMemo<BasicCatalogFilters>(
    () => ({
      search: debouncedSearch || undefined,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
      page,
      limit: DEFAULT_LIMIT,
    }),
    [debouncedSearch, category, minPrice, maxPrice, sort, page],
  );

  const info = useBasicCatalogInfo(url);
  const products = useBasicCatalogProducts(url, filters);

  const company: BasicCatalogCompany | undefined = info.data?.company;
  const categories: string[] = info.data?.categories ?? [];
  const catalogStyle = catalogColorsToStyle(
    mergeCatalogColors(company?.catalogColors),
  );

  return (
    <div
      className="catalog-root flex min-h-screen flex-col"
      style={{
        ...catalogStyle,
        backgroundColor: 'var(--catalog-bg)',
        color: 'var(--catalog-text)',
      }}
    >
      {company ? (
        <BasicCatalogHeader
          company={company}
          onOpenCart={() => setCartOpen(true)}
        />
      ) : null}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
          <div className="md:flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <FilterDrawer
            categories={categories}
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sort={sort}
            onCategoryChange={setCategory}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onSortChange={setSort}
            onReset={resetFilters}
          />
        </div>

        {products.isError ? (
          <p className="py-8 text-center text-sm text-red-600">
            Erro ao carregar produtos. Tente novamente.
          </p>
        ) : products.data && products.data.products.length === 0 ? (
          <EmptyProducts onClear={resetFilters} />
        ) : products.data ? (
          <>
            <ProductGrid
              company={company!}
              data={products.data}
              onOpenProduct={openProduct}
            />
            {products.data.totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
                  disabled={page <= 1 || products.isFetching}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  Anterior
                </button>
                <span className="text-sm tabular-nums opacity-70">
                  Página {page} de {products.data.totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
                  disabled={page >= products.data.totalPages || products.isFetching}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </main>

      {company ? (
        <>
          <CartBar
            brandColor={company.brandColor}
            onOpen={() => setCartOpen(true)}
            hidden={cartOpen}
          />
          <CartDrawer
            open={cartOpen}
            onOpenChange={setCartOpen}
            company={company}
          />
          <CatalogFooter company={company} />
        </>
      ) : null}

      <ProductDetailModal
        url={url}
        productId={productId}
        onClose={closeProduct}
        brandColor={company?.brandColor}
      />
    </div>
  );
}
