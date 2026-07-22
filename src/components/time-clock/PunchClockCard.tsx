'use client';

import { useState } from 'react';
import { Clock, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PunchTypeIcon, PUNCH_TYPE_LABELS } from './PunchTypeIcon';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useRegisterTimeClock,
} from '@/hooks/useTimeClock';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';
import type { TimeClockConfig, TimeClockTodayResponse, TimeClockType } from '@/types';

interface Props {
  onRequireQrScan?: () => void;
  config?: TimeClockConfig | null;
  className?: string;
  today?: TimeClockTodayResponse | null;
  loading?: boolean;
  onPunched?: () => void;
  qrToken?: string;
}

export function PunchClockCard({
  onRequireQrScan,
  config,
  className,
  today,
  loading,
  onPunched,
  qrToken,
}: Props) {
  const { coords, status: geoStatus, refresh: refreshGeo } = useGeolocation({
    autoStart: true,
  });
  const register = useRegisterTimeClock();
  const [lastResult, setLastResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const punches = today?.punches ?? [];
  const nextExpected = today?.nextExpected;
  const completed = punches.length >= 4;
  const progress = (punches.length / 4) * 100;

  const handlePunch = async (token?: string) => {
    if (!nextExpected) return;

    const needsLocation = config?.requireLocation ?? true;
    const needsQr = config?.requireQrCode ?? false;
    const hasLocation = !!coords;

    if (needsLocation && !hasLocation) {
      refreshGeo();
      setLastResult({
        ok: false,
        message: 'Aguardando GPS. Tente novamente em alguns segundos.',
      });
      return;
    }
    if (needsQr && !token) {
      onRequireQrScan?.();
      return;
    }

    setLastResult(null);
    try {
      const result = await register.mutateAsync({
        type: nextExpected,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        accuracyMeters: coords?.accuracyMeters,
        qrToken: token,
        deviceInfo: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          platform: typeof navigator !== 'undefined' ? navigator.platform : '',
          language: typeof navigator !== 'undefined' ? navigator.language : '',
        },
      });
      const pending = result?.status === 'PENDING_REVIEW';
      const type = (result?.type as TimeClockType) ?? nextExpected;
      setLastResult({
        ok: !pending,
        message: pending
          ? 'Ponto registrado, mas está fora do raio. Aguardando aprovação.'
          : `Ponto de ${PUNCH_TYPE_LABELS[type] ?? 'marcado'} registrado!`,
      });
      onPunched?.();
    } catch (e: any) {
      setLastResult({
        ok: false,
        message: e?.response?.data?.message || 'Erro ao registrar ponto.',
      });
    }
  };

  return (
    <Card className={cn('border-2', className)}>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1">
              {format(new Date(), 'HH:mm', { locale: ptBR })}
            </h2>
          </div>
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progresso do dia</span>
            <span>
              {punches.length}/4 marcações
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Carregando...
          </div>
        ) : completed ? (
          <div className="flex flex-col items-center gap-2 py-4 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
            <p className="font-semibold">Jornada completa!</p>
            <p className="text-xs text-muted-foreground">
              Você já registrou todas as marcações de hoje.
            </p>
          </div>
        ) : nextExpected ? (
          <>
            <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/40 dark:bg-blue-950/30 dark:border-blue-800 p-4 flex items-center gap-3">
              <PunchTypeIcon type={nextExpected as TimeClockType} size="lg" />
              <div>
                <p className="text-xs text-muted-foreground">Próxima marcação</p>
                <p className="text-lg font-semibold">
                  {PUNCH_TYPE_LABELS[nextExpected as TimeClockType]}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={register.isPending || geoStatus === 'denied'}
              onClick={() => handlePunch(qrToken)}
            >
              {register.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Bater ponto agora
                </>
              )}
            </Button>
          </>
        ) : null}

        {lastResult && (
          <Alert variant={lastResult.ok ? 'success' : 'warning'}>
            {lastResult.ok ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle>
              {lastResult.ok ? 'Ponto registrado' : 'Atenção'}
            </AlertTitle>
            <AlertDescription>{lastResult.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
