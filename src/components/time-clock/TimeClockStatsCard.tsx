'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, TrendingUp, AlertTriangle, CalendarCheck } from 'lucide-react';
import { formatMinutesLong } from './format';
import type { TimeClockStats } from '@/types';

interface Props {
  stats?: TimeClockStats;
  loading?: boolean;
  title?: string;
}

export function TimeClockStatsCard({ stats, loading, title = 'Estatísticas do Mês' }: Props) {
  if (loading || !stats) {
    return (
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatItem
            Icon={Clock}
            label="Horas no mês"
            value={formatMinutesLong(stats.totalWorkedMinutes)}
            tone="text-blue-700"
          />
          <StatItem
            Icon={CalendarCheck}
            label="Dias trabalhados"
            value={`${stats.workedDays}/${stats.totalDays}`}
            tone="text-emerald-700"
          />
          <StatItem
            Icon={TrendingUp}
            label="Horas extras"
            value={formatMinutesLong(stats.totalOvertimeMinutes)}
            tone="text-purple-700"
          />
          <StatItem
            Icon={AlertTriangle}
            label="Atrasos"
            value={formatMinutesLong(stats.totalLateMinutes)}
            tone="text-amber-700"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: typeof Clock;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border p-2 bg-card">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${tone}`} />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-base font-semibold mt-0.5 leading-tight">{value}</p>
    </div>
  );
}
