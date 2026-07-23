'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sellerScheduleApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';
import type { SellerSchedule, UpdateSellerScheduleDto } from '@/types';

const KEYS = {
  schedule: (sellerId: string) => ['seller-schedule', sellerId] as const,
};

/**
 * Hook para obter a jornada individual configurada de um vendedor.
 */
export function useSellerSchedule(sellerId: string | null | undefined) {
  return useQuery<{ sellerId: string; schedule: SellerSchedule | null }>({
    queryKey: KEYS.schedule(sellerId ?? ''),
    queryFn: async () => (await sellerScheduleApi.get(sellerId!)).data,
    enabled: !!sellerId,
    staleTime: 5 * 60_000,
  });
}

/**
 * Hook de mutação para criar/atualizar a jornada individual de um vendedor.
 */
export function useUpsertSellerSchedule(sellerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateSellerScheduleDto) =>
      (await sellerScheduleApi.upsert(sellerId, data)).data,
    onSuccess: (result) => {
      qc.setQueryData(KEYS.schedule(sellerId), {
        sellerId,
        schedule: result as SellerSchedule,
      });
      qc.invalidateQueries({ queryKey: KEYS.schedule(sellerId) });
      qc.invalidateQueries({ queryKey: ['time-clock', 'my-schedule'] });
      toast.success('Jornada atualizada com sucesso!');
    },
    onError: (err) => toast.error(handleApiError(err).message),
  });
}

/**
 * Hook de mutação para remover a jornada individual (volta a usar a da empresa).
 */
export function useDeleteSellerSchedule(sellerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await sellerScheduleApi.remove(sellerId)).data,
    onSuccess: () => {
      qc.setQueryData(KEYS.schedule(sellerId), { sellerId, schedule: null });
      qc.invalidateQueries({ queryKey: KEYS.schedule(sellerId) });
      qc.invalidateQueries({ queryKey: ['time-clock', 'my-schedule'] });
      toast.success('Jornada removida. Voltou a usar a da empresa.');
    },
    onError: (err) => toast.error(handleApiError(err).message),
  });
}
