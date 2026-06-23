'use client';

import { PendingApprovalsList } from '@/components/time-clock/PendingApprovalsList';
import { TimeClockStatsCard } from '@/components/time-clock/TimeClockStatsCard';
import { useTimeClockStats } from '@/hooks/useTimeClock';

export default function TimeClockPendingPage() {
  const { data: stats, isLoading } = useTimeClockStats();

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Pontos pendentes</h1>
        <p className="text-sm text-muted-foreground">
          Marcações feitas fora do raio da loja, aguardando aprovação.
        </p>
      </div>

      <PendingApprovalsList />

      <TimeClockStatsCard
        stats={stats}
        loading={isLoading}
        title="Indicadores da empresa"
      />
    </div>
  );
}
