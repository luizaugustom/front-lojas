'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogConfigApi } from '@/lib/api-endpoints';
import type { CatalogConfig, UpdateCatalogConfigPayload } from '@/lib/storefront-types';

const KEYS = {
  config: ['catalog-config'] as const,
};

export function useCatalogConfig() {
  return useQuery({
    queryKey: KEYS.config,
    queryFn: async () => (await catalogConfigApi.get()).data as CatalogConfig,
    staleTime: 60_000,
  });
}

export function useUpdateCatalogConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateCatalogConfigPayload) =>
      (await catalogConfigApi.update(payload)).data as CatalogConfig,
    onSuccess: (data) => {
      qc.setQueryData(KEYS.config, data);
    },
  });
}

export function useUploadCatalogAsset() {
  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'logo' | 'hero' }) =>
      (await catalogConfigApi.uploadAsset(file, type)).data,
  });
}
