'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  useBasicCatalogInfo,
  useBasicCatalogProducts,
} from '@/hooks/useBasicCatalog';
import { BasicCatalogView } from './components/BasicCatalogView';
import { BasicCatalogSkeleton } from './components/BasicCatalogSkeleton';
import { BasicCatalogError } from './components/BasicCatalogError';

export default function CatalogPageClient() {
  const params = useParams<{ url: string }>();
  const url = decodeURIComponent(params?.url ?? '');

  const info = useBasicCatalogInfo(url);
  const products = useBasicCatalogProducts(url, {});

  useEffect(() => {
    if (info.data?.company) {
      const name =
        info.data.company.fantasyName?.trim() || info.data.company.name;
      document.title = `Catálogo ${name}`;
    }
  }, [info.data]);

  if (!url) return <BasicCatalogError />;
  if (info.isLoading || products.isLoading) return <BasicCatalogSkeleton />;
  if (info.error || !info.data) {
    return <BasicCatalogError onRetry={() => info.refetch()} />;
  }

  return <BasicCatalogView url={url} />;
}