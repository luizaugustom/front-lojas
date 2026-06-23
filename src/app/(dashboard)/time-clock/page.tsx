'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHelpModal } from '@/components/help';
import {
  getTimeClockHelpTabs,
  timeClockHelpTitle,
  timeClockHelpDescription,
  timeClockHelpIcon,
} from '@/components/help/contents/time-clock-help';
import { PunchClockCard } from '@/components/time-clock/PunchClockCard';
import { QrScanner } from '@/components/time-clock/QrScanner';
import { LocationPrompt } from '@/components/time-clock/LocationPrompt';
import { PunchHistoryList } from '@/components/time-clock/PunchHistoryList';
import { NextExpectedPunch, TIME_CLOCK_ORDER } from '@/components/time-clock/NextExpectedPunch';
import { TimeClockStatsCard } from '@/components/time-clock/TimeClockStatsCard';
import { useMyToday, useMyStats, useTimeClockConfig } from '@/hooks/useTimeClock';

export default function TimeClockPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrToken, setQrToken] = useState<string | undefined>();

  const { data: today, isLoading: loadingToday } = useMyToday(true);
  const { data: stats, isLoading: loadingStats } = useMyStats();
  const { data: config } = useTimeClockConfig();

  const punches = (today?.punches ?? []).map((p: any) => ({
    id: p.id,
    type: p.type,
    timestamp: p.timestamp,
    status: p.status,
    distanceMeters: p.distanceMeters,
  }));

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ponto Eletrônico</h1>
          <p className="text-sm text-muted-foreground">
            Bate ponto com QR Code e geolocalização da loja.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setHelpOpen(true)}
          aria-label="Ajuda"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      <PunchClockCard
        config={config}
        onRequireQrScan={() => setScannerOpen(true)}
      />

      <NextExpectedPunch
        nextType={today?.nextExpected ?? null}
        order={TIME_CLOCK_ORDER}
      />

      {config?.requireQrCode && scannerOpen && (
        <QrScanner
          onScan={(token) => {
            setQrToken(token);
            setScannerOpen(false);
          }}
          onClose={() => setScannerOpen(false)}
        />
      )}

      <LocationPrompt config={config} />

      <PunchHistoryList
        punches={punches}
        loading={loadingToday}
        title="Marcações de hoje"
        emptyMessage="Nenhuma marcação registrada ainda hoje. Bate o ponto acima!"
      />

      <TimeClockStatsCard stats={stats} loading={loadingStats} />

      <PageHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={timeClockHelpTitle}
        description={timeClockHelpDescription}
        icon={timeClockHelpIcon}
        tabs={getTimeClockHelpTabs()}
      />
    </div>
  );
}
