'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { timeClockApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';
import type {
  AdjustTimeClockDto,
  MyScheduleResponse,
  RegisterTimeClockDto,
  RejectTimeClockDto,
  TimeClockFilterDto,
} from '@/types';

const KEYS = {
  myToday: () => ['time-clock', 'my-today'] as const,
  myHistory: (filter: TimeClockFilterDto) =>
    ['time-clock', 'my-history', filter] as const,
  myStats: (month?: string) => ['time-clock', 'my-stats', month] as const,
  mySchedule: () => ['time-clock', 'my-schedule'] as const,
  config: (companyId?: string) => ['time-clock', 'config', companyId] as const,
  qrCode: () => ['time-clock', 'qr-code'] as const,
  pending: () => ['time-clock', 'pending'] as const,
  list: (filter: TimeClockFilterDto) => ['time-clock', 'list', filter] as const,
  bySeller: (sellerId: string, filter: TimeClockFilterDto) =>
    ['time-clock', 'by-seller', sellerId, filter] as const,
  stats: (month?: string) => ['time-clock', 'stats', month] as const,
};

// =================== QUERIES (VENDEDOR) ===================

export function useMyToday(enabled = true) {
  return useQuery({
    queryKey: KEYS.myToday(),
    queryFn: async () => (await timeClockApi.myToday()).data,
    enabled,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useMyHistory(filter: TimeClockFilterDto = {}) {
  return useQuery({
    queryKey: KEYS.myHistory(filter),
    queryFn: async () => (await timeClockApi.myHistory(filter)).data,
    staleTime: 60_000,
  });
}

export function useMyStats(month?: string) {
  return useQuery({
    queryKey: KEYS.myStats(month),
    queryFn: async () => (await timeClockApi.myStats({ month })).data,
    staleTime: 60_000,
  });
}

export function useMySchedule(enabled = true) {
  return useQuery<MyScheduleResponse>({
    queryKey: KEYS.mySchedule(),
    queryFn: async () => (await timeClockApi.mySchedule()).data,
    enabled,
    refetchOnWindowFocus: true,
    staleTime: 60_000,
  });
}

// =================== MUTATIONS (VENDEDOR) ===================

export function useRegisterTimeClock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegisterTimeClockDto) =>
      (await timeClockApi.register(data)).data,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['time-clock', 'my-today'] });
      qc.invalidateQueries({ queryKey: ['time-clock', 'my-history'] });
      qc.invalidateQueries({ queryKey: ['time-clock', 'my-stats'] });
      qc.invalidateQueries({ queryKey: ['time-clock', 'pending'] });
      qc.invalidateQueries({ queryKey: ['time-clock', 'list'] });
      const label = result?.nextExpected
        ? `Ponto registrado! Próxima: ${result.nextExpected}`
        : 'Ponto registrado com sucesso!';
      toast.success(label);
    },
    onError: (err) => {
      const { message } = handleApiError(err);
      toast.error(message);
    },
  });
}

// =================== CONFIG (EMPRESA) ===================

export function useTimeClockConfig(companyId?: string) {
  return useQuery({
    queryKey: KEYS.config(companyId),
    queryFn: async () =>
      (await timeClockApi.getConfig(companyId ? { companyId } : undefined)).data,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateTimeClockConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) =>
      (await timeClockApi.updateConfig(data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-clock', 'config'] });
      toast.success('Configuração atualizada com sucesso!');
    },
    onError: (err) => {
      toast.error(handleApiError(err).message);
    },
  });
}

export function useRegenerateQr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await timeClockApi.regenerateQr()).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-clock', 'config'] });
      qc.invalidateQueries({ queryKey: ['time-clock', 'qr-code'] });
      toast.success('QR Code da loja rotacionado com sucesso!');
    },
    onError: (err) => toast.error(handleApiError(err).message),
  });
}

export function useTimeClockQrCode(enabled = true) {
  return useQuery({
    queryKey: KEYS.qrCode(),
    queryFn: async () => (await timeClockApi.getQrCode()).data,
    enabled,
    staleTime: 5 * 60_000,
  });
}

// =================== GESTÃO (EMPRESA) ===================

export function usePendingTimeClocks() {
  return useQuery({
    queryKey: KEYS.pending(),
    queryFn: async () => (await timeClockApi.pending()).data,
    refetchInterval: 60_000,
  });
}

export function useTimeClockList(filter: TimeClockFilterDto = {}) {
  return useQuery({
    queryKey: KEYS.list(filter),
    queryFn: async () => (await timeClockApi.list(filter)).data,
    staleTime: 30_000,
  });
}

export function useSellerTimeClockHistory(
  sellerId: string,
  filter: TimeClockFilterDto = {},
) {
  return useQuery({
    queryKey: KEYS.bySeller(sellerId, filter),
    queryFn: async () =>
      (await timeClockApi.bySeller(sellerId, filter)).data,
    enabled: !!sellerId,
    staleTime: 30_000,
  });
}

export function useTimeClockStats(month?: string) {
  return useQuery({
    queryKey: KEYS.stats(month),
    queryFn: async () => (await timeClockApi.stats({ month })).data,
    staleTime: 60_000,
  });
}

export function useApproveTimeClock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await timeClockApi.approve(id)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-clock'] });
      toast.success('Ponto aprovado com sucesso!');
    },
    onError: (err) => toast.error(handleApiError(err).message),
  });
}

export function useRejectTimeClock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: RejectTimeClockDto;
    }) => (await timeClockApi.reject(id, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-clock'] });
      toast.success('Marcação rejeitada.');
    },
    onError: (err) => toast.error(handleApiError(err).message),
  });
}

export function useAdjustTimeClock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AdjustTimeClockDto;
    }) => (await timeClockApi.adjust(id, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-clock'] });
      toast.success('Marcação ajustada com sucesso!');
    },
    onError: (err) => toast.error(handleApiError(err).message),
  });
}
