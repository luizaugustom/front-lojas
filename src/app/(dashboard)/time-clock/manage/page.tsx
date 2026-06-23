'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaginationControls } from '@/components/ui/pagination-controls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PunchTypeIcon, PUNCH_TYPE_LABELS } from '@/components/time-clock/PunchTypeIcon';
import { PunchStatusBadge } from '@/components/time-clock/PunchStatusBadge';
import { TimeClockStatsCard } from '@/components/time-clock/TimeClockStatsCard';
import { TimeClockReportForm } from '@/components/time-clock/TimeClockReportForm';
import { PendingApprovalsList } from '@/components/time-clock/PendingApprovalsList';
import { AdjustPunchDialog } from '@/components/time-clock/AdjustPunchDialog';
import { formatDistance } from '@/components/time-clock/format';
import {
  useSellerTimeClockHistory,
  useTimeClockList,
  useTimeClockStats,
} from '@/hooks/useTimeClock';
import { useQuery } from '@tanstack/react-query';
import { sellerApi } from '@/lib/api-endpoints';
import { useAuth } from '@/hooks/useAuth';
import { Edit3, ListChecks } from 'lucide-react';
import type { TimeClock, TimeClockStatus, TimeClockType } from '@/types';

const STATUS_FILTERS: Array<{ value: TimeClockStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'VALID', label: 'Válidos' },
  { value: 'PENDING_REVIEW', label: 'Pendentes' },
  { value: 'REJECTED', label: 'Rejeitados' },
  { value: 'ADJUSTED', label: 'Ajustados' },
];

export default function TimeClockManagePage() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(
    format(firstDayOfMonth(), 'yyyy-MM-dd'),
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sellerFilter, setSellerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<TimeClockStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<TimeClockType | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const limit = 25;
  const [adjustTarget, setAdjustTarget] = useState<TimeClock | null>(null);

  const { data: sellersResp } = useQuery({
    queryKey: ['sellers', 'time-clock-manage'],
    queryFn: async () =>
      (await sellerApi.list({ companyId: user?.companyId || undefined })).data,
    enabled: !!user?.companyId,
    staleTime: 60_000,
  });
  const sellers: Array<{ id: string; name: string }> = Array.isArray(sellersResp)
    ? sellersResp
    : sellersResp?.data ?? [];

  const filter = {
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(`${endDate}T23:59:59`).toISOString(),
    sellerId: sellerFilter === 'ALL' ? undefined : sellerFilter,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    page,
    limit,
  };

  const { data, isLoading } = useTimeClockList(filter);
  const { data: stats, isLoading: loadingStats } = useTimeClockStats();

  const items: TimeClock[] = Array.isArray(data)
    ? data
    : (data as any)?.data ?? [];
  const total: number = (data as any)?.total ?? items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Ponto</h1>
        <p className="text-sm text-muted-foreground">
          Visualize, aprove e ajuste as marcações dos funcionários.
        </p>
      </div>

      <TimeClockStatsCard stats={stats} loading={loadingStats} />

      <PendingApprovalsList />

      <TimeClockReportForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Todas as marcações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label htmlFor="start" className="text-xs">De</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end" className="text-xs">Até</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Funcionário</Label>
              <Select value={sellerFilter} onValueChange={(v) => { setSellerFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as TimeClockType | 'ALL'); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {(Object.keys(PUNCH_TYPE_LABELS) as TimeClockType[]).map((t) => (
                    <SelectItem key={t} value={t}>{PUNCH_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as TimeClockStatus | 'ALL'); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma marcação encontrada com esses filtros.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b">
                      <th className="py-2 pr-2">Data/Hora</th>
                      <th className="py-2 pr-2">Funcionário</th>
                      <th className="py-2 pr-2">Tipo</th>
                      <th className="py-2 pr-2">Distância</th>
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-2 pr-2 whitespace-nowrap">
                          {format(new Date(p.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                        </td>
                        <td className="py-2 pr-2">{p.seller?.name ?? '—'}</td>
                        <td className="py-2 pr-2">
                          <PunchTypeIcon type={p.type} size="sm" showLabel />
                        </td>
                        <td className="py-2 pr-2 text-xs text-muted-foreground">
                          {typeof p.distanceMeters === 'number'
                            ? formatDistance(p.distanceMeters)
                            : '—'}
                        </td>
                        <td className="py-2 pr-2">
                          <PunchStatusBadge status={p.status} />
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAdjustTarget(p)}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={total}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AdjustPunchDialog
        punch={adjustTarget}
        onClose={() => setAdjustTarget(null)}
      />
    </div>
  );
}

function firstDayOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
