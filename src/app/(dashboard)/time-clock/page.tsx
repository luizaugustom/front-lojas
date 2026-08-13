'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { HelpCircle, Clock, ListChecks, AlertCircle, Info, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHelpModal } from '@/components/help';
import {
  getTimeClockHelpTabs,
  timeClockHelpTitle,
  timeClockHelpDescription,
  timeClockHelpIcon,
} from '@/components/help/contents/time-clock-help';
import {
  PunchClockCard,
  type PunchClockApi,
} from '@/components/time-clock/PunchClockCard';
import { QrScanner } from '@/components/time-clock/QrScanner';
import { LocationPrompt } from '@/components/time-clock/LocationPrompt';
import { PunchHistoryList } from '@/components/time-clock/PunchHistoryList';
import { VendorScheduleCard } from '@/components/time-clock/VendorScheduleCard';
import { TimeClockStatsCard } from '@/components/time-clock/TimeClockStatsCard';
import { TimeClockReportForm } from '@/components/time-clock/TimeClockReportForm';
import { PendingApprovalsList } from '@/components/time-clock/PendingApprovalsList';
import { TimeClockHistoryView } from '@/components/time-clock/TimeClockHistoryView';
import { TimeClockManageView } from '@/components/time-clock/TimeClockManageView';
import { QrCodeDisplay } from '@/components/time-clock/QrCodeDisplay';
import {
  useMyToday,
  useMyStats,
  useMySchedule,
  useTimeClockConfig,
} from '@/hooks/useTimeClock';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsMobile } from '@/hooks/useResponsive';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

type TabKey = 'punch' | 'history' | 'pending' | 'manage';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const ALL_TABS: TabDef[] = [
  { key: 'punch', label: 'Bater Ponto', icon: Clock, roles: ['vendedor'] },
  { key: 'punch', label: 'QR da Loja', icon: QrCode, roles: ['empresa', 'admin', 'gestor'] },
  { key: 'history', label: 'Histórico', icon: ListChecks, roles: ['vendedor'] },
  { key: 'pending', label: 'Pendentes', icon: AlertCircle, roles: ['empresa', 'admin', 'gestor'] },
  { key: 'manage', label: 'Histórico Geral', icon: ListChecks, roles: ['empresa', 'admin', 'gestor'] },
];

export default function TimeClockPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const locationCardRef = useRef<HTMLDivElement>(null);
  const punchApiRef = useRef<PunchClockApi | null>(null);
  const isMobile = useIsMobile();

  const { user } = useAuth();
  const role = (user?.role ?? 'vendedor') as UserRole;
  const isCompany = role === 'empresa' || role === 'admin' || role === 'gestor';
  const isVendedor = role === 'vendedor';

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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

  const {
    coords,
    status: geoStatus,
    error: geoError,
    loading: geoLoading,
    refresh: refreshGeo,
  } = useGeolocation({ autoStart: isVendedor });

  const { data: today, isLoading: loadingToday, refetch: refetchToday } = useMyToday(isVendedor);
  const { data: stats, isLoading: loadingStats } = useMyStats();
  const { data: config } = useTimeClockConfig();
  const { data: mySchedule, isLoading: loadingSchedule } = useMySchedule(isVendedor);

  const punches = (today?.punches ?? []).map((p: any) => ({
    id: p.id,
    type: p.type,
    timestamp: p.timestamp,
    status: p.status,
    distanceMeters: p.distanceMeters,
  }));
  const focusLocation = () => {
    refreshGeo();
    requestAnimationFrame(() => {
      locationCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handlePunchReady = useCallback((api: PunchClockApi) => {
    punchApiRef.current = api;
  }, []);

  const handleQrScanned = (token: string) => {
    setScannerOpen(false);
    punchApiRef.current?.punchWithToken(token);
  };

  // Vendedor: config vem de my-today; empresa/admin: endpoint /config
  const effectiveConfig = config ?? today?.config ?? null;

  const punchCard = (
    <PunchClockCard
      config={effectiveConfig}
      today={today}
      loading={loadingToday}
      onPunched={refetchToday}
      onRequireQrScan={() => setScannerOpen(true)}
      onReady={handlePunchReady}
      coords={coords}
      geoStatus={geoStatus}
      onRequestLocation={focusLocation}
    />
  );

  const qrDialog = (
    <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
      <DialogContent className="sm:max-w-md p-4">
        <DialogHeader>
          <DialogTitle>Ler QR Code da loja</DialogTitle>
          <DialogDescription>
            Aponte a câmera para o QR Code gerado pela empresa. O ponto será
            registrado automaticamente após a leitura.
          </DialogDescription>
        </DialogHeader>
        {scannerOpen && (
          <QrScanner
            autoStart
            containerId="time-clock-qr-scanner"
            onScan={handleQrScanned}
            onClose={() => setScannerOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );

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
          {isVendedor ? (
            <>
              {isMobile ? (
                <>
                  {punchCard}
                  <VendorScheduleCard
                    today={mySchedule?.today ?? null}
                    nextExpected={today?.nextExpected ?? null}
                    loading={loadingSchedule && !mySchedule}
                    punchesReady={!!today}
                  />
                </>
              ) : (
                <>
                  <VendorScheduleCard
                    today={mySchedule?.today ?? null}
                    nextExpected={today?.nextExpected ?? null}
                    loading={loadingSchedule && !mySchedule}
                    punchesReady={!!today}
                  />
                  {punchCard}
                </>
              )}

              {qrDialog}

              <LocationPrompt
                config={effectiveConfig}
                coords={coords}
                status={geoStatus}
                error={geoError}
                loading={geoLoading}
                onRefresh={refreshGeo}
                cardRef={locationCardRef}
              />

              <PunchHistoryList
                punches={punches}
                loading={loadingToday}
                title="Marcações de hoje"
                emptyMessage="Nenhuma marcação registrada ainda hoje. Bate o ponto acima!"
              />
            </>
          ) : (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Ponto é batido pelos vendedores</AlertTitle>
                <AlertDescription>
                  Contas de empresa/gestor não registram ponto. Exiba o QR Code
                  abaixo para os vendedores lerem no celular.
                </AlertDescription>
              </Alert>

              <QrCodeDisplay />

              <TimeClockStatsCard stats={stats} loading={loadingStats} />
            </>
          )}
        </TabsContent>

        {isVendedor && (
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
