'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { HelpCircle, Clock, ListChecks, AlertCircle, QrCode, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { TimeClockReportForm } from '@/components/time-clock/TimeClockReportForm';
import { PendingApprovalsList } from '@/components/time-clock/PendingApprovalsList';
import { QrCodeDisplay } from '@/components/time-clock/QrCodeDisplay';
import { TimeClockConfigForm } from '@/components/time-clock/TimeClockConfigForm';
import { TimeClockHistoryView } from '@/components/time-clock/TimeClockHistoryView';
import { TimeClockManageView } from '@/components/time-clock/TimeClockManageView';
import { useMyToday, useMyStats, useTimeClockConfig } from '@/hooks/useTimeClock';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

type TabKey = 'punch' | 'history' | 'pending' | 'manage' | 'qr' | 'config';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const ALL_TABS: TabDef[] = [
  { key: 'punch', label: 'Bater Ponto', icon: Clock, roles: ['vendedor', 'empresa', 'admin', 'gestor'] },
  { key: 'history', label: 'Histórico', icon: ListChecks, roles: ['vendedor'] },
  { key: 'pending', label: 'Pendentes', icon: AlertCircle, roles: ['empresa', 'admin', 'gestor'] },
  { key: 'manage', label: 'Histórico Geral', icon: ListChecks, roles: ['empresa', 'admin', 'gestor'] },
  { key: 'qr', label: 'QR da Loja', icon: QrCode, roles: ['empresa', 'admin'] },
  { key: 'config', label: 'Configurações', icon: SettingsIcon, roles: ['empresa', 'admin'] },
];

export default function TimeClockPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrToken, setQrToken] = useState<string | undefined>();

  const { user } = useAuth();
  const role = (user?.role ?? 'vendedor') as UserRole;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Deduplica tabs (caso duas entradas tenham a mesma `key`, mantém a primeira
  // que casa com o role do usuário).
  const allowedTabs = useMemo(() => {
    const seen = new Set<TabKey>();
    return ALL_TABS.filter((t) => {
      if (!t.roles.includes(role)) return false;
      if (seen.has(t.key)) return false;
      seen.add(t.key);
      return true;
    });
  }, [role]);

  const requestedTab = searchParams.get('tab') as TabKey | null;
  const initialTab =
    requestedTab && allowedTabs.some((t) => t.key === requestedTab)
      ? requestedTab
      : 'punch';

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Se o papel mudar e a aba ativa não for mais permitida, voltar para 'punch'
  useEffect(() => {
    if (!allowedTabs.some((t) => t.key === activeTab)) {
      setActiveTab('punch');
    }
  }, [allowedTabs, activeTab]);

  const handleTabChange = (value: string) => {
    const next = value as TabKey;
    setActiveTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'punch') {
      params.delete('tab');
    } else {
      params.set('tab', next);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  };

  const { data: today, isLoading: loadingToday, refetch: refetchToday } = useMyToday(true);
  const { data: stats, isLoading: loadingStats } = useMyStats();
  const { data: config } = useTimeClockConfig();

  const punches = (today?.punches ?? []).map((p: any) => ({
    id: p.id,
    type: p.type,
    timestamp: p.timestamp,
    status: p.status,
    distanceMeters: p.distanceMeters,
  }));

  const isCompany = role === 'empresa' || role === 'admin' || role === 'gestor';
  const isAdminCompany = role === 'empresa' || role === 'admin';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
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

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="overflow-x-auto -mx-1">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            {allowedTabs.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.key}
                  value={t.key}
                  className="flex items-center gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="punch" className="space-y-4 max-w-2xl mx-auto">
          <PunchClockCard
            config={config}
            today={today}
            loading={loadingToday}
            onPunched={refetchToday}
            qrToken={qrToken}
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
        </TabsContent>

        {role === 'vendedor' && (
          <TabsContent value="history" className="max-w-3xl mx-auto">
            <TimeClockHistoryView />
          </TabsContent>
        )}

        {isCompany && (
          <>
            <TabsContent value="pending" className="space-y-4 max-w-3xl mx-auto">
              <PendingApprovalsList />
              <TimeClockStatsCard
                stats={stats}
                loading={loadingStats}
                title="Indicadores da empresa"
              />
            </TabsContent>

            <TabsContent value="manage" className="space-y-4 max-w-5xl mx-auto">
              <TimeClockManageView />
              <TimeClockReportForm />
            </TabsContent>
          </>
        )}

        {isAdminCompany && (
          <>
            <TabsContent value="qr" className="space-y-4 max-w-3xl mx-auto">
              <QrCodeDisplay />
              <TimeClockConfigForm />
            </TabsContent>

            <TabsContent value="config" className="max-w-3xl mx-auto">
              <TimeClockConfigForm />
            </TabsContent>
          </>
        )}
      </Tabs>

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
