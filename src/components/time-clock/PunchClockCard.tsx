'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PunchTypeIcon, PUNCH_TYPE_LABELS } from './PunchTypeIcon';
import { resolvePunchAction } from './punch-action';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRegisterTimeClock } from '@/hooks/useTimeClock';
import { cn } from '@/lib/utils';
import type {
  GeolocationCoords,
  GeolocationStatus,
} from '@/hooks/useGeolocation';
import type { TimeClockConfig, TimeClockTodayResponse, TimeClockType } from '@/types';

export interface PunchClockApi {
  punchWithToken: (token: string) => void;
}

interface Props {
  onRequireQrScan?: () => void;
  /** Expõe punchWithToken para o pai registrar após ler o QR */
  onReady?: (api: PunchClockApi) => void;
  config?: TimeClockConfig | null;
  className?: string;
  today?: TimeClockTodayResponse | null;
  loading?: boolean;
  onPunched?: () => void;
  qrToken?: string;
  coords: GeolocationCoords | null;
  geoStatus: GeolocationStatus;
  onRequestLocation: () => void;
}

export function PunchClockCard({
  onRequireQrScan,
  onReady,
  config,
  className,
  today,
  loading,
  onPunched,
  qrToken,
  coords,
  geoStatus,
  onRequestLocation,
}: Props) {
  const register = useRegisterTimeClock();
  const [lastResult, setLastResult] = useState<{
    ok: boolean;
    message: string;
    locationError?: boolean;
  } | null>(null);

  const punches = today?.punches ?? [];
  const nextExpected = today?.nextExpected ?? null;
  const completed = !!today && punches.length >= 4;
  // Sem my-today / nextExpected: não esconder o CTA — assume ENTRY
  const displayNext: TimeClockType | null =
    loading || completed ? null : (nextExpected ?? 'ENTRY');
  const progress = (Math.min(punches.length, 4) / 4) * 100;

  const handlePunchRef = useRef<(token?: string) => Promise<void>>(async () => {});

  const handlePunch = async (token?: string) => {
    if (register.isPending) return;
    const punchType = (nextExpected ?? displayNext) as TimeClockType | null;
    if (!punchType || completed) return;

    const requireLocation = config?.requireLocation ?? true;
    const requireQrCode = config?.requireQrCode ?? false;
    const effectiveToken = token ?? qrToken;
    const action = resolvePunchAction({
      requireLocation,
      requireQrCode,
      hasLocation: !!coords,
      hasQrToken: !!effectiveToken,
    });

    if (action.kind === 'need_location') {
      onRequestLocation();
      setLastResult({
        ok: false,
        message:
          geoStatus === 'denied'
            ? 'Localização bloqueada. Libere o acesso e clique em "Tentar novamente" abaixo.'
            : 'Aguardando GPS. Confirme a permissão no navegador para continuar.',
        locationError: true,
      });
      return;
    }

    if (action.kind === 'need_qr') {
      onRequireQrScan?.();
      return;
    }

    setLastResult(null);
    try {
      const result = await register.mutateAsync({
        type: punchType,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        accuracyMeters: coords?.accuracyMeters,
        qrToken: effectiveToken,
        deviceInfo: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          platform: typeof navigator !== 'undefined' ? navigator.platform : '',
          language: typeof navigator !== 'undefined' ? navigator.language : '',
        },
      });
      const pending = result?.status === 'PENDING_REVIEW';
      const type = (result?.type as TimeClockType) ?? punchType;
      setLastResult({
        ok: !pending,
        message: pending
          ? 'Ponto registrado, mas está fora do raio. Aguardando aprovação.'
          : `Ponto de ${PUNCH_TYPE_LABELS[type] ?? 'marcado'} registrado!`,
      });
      onPunched?.();
    } catch (e: any) {
      const apiMessage: string =
        e?.response?.data?.message || 'Erro ao registrar ponto.';
      const isLocationErr = /localiza|geolocaliza|location/i.test(apiMessage);
      setLastResult({
        ok: false,
        message: isLocationErr
          ? 'Esta loja exige geolocalização. Permita o acesso para bater o ponto.'
          : apiMessage,
        locationError: isLocationErr,
      });
    }
  };

  handlePunchRef.current = handlePunch;

  useEffect(() => {
    if (!onReady) return;
    onReady({
      punchWithToken: (token: string) => {
        void handlePunchRef.current(token);
      },
    });
  }, [onReady]);

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
            <span>{punches.length}/4 marcações</span>
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
        ) : displayNext ? (
          <>
            <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/40 dark:bg-blue-950/30 dark:border-blue-800 p-4 flex items-center gap-3">
              <PunchTypeIcon type={displayNext} size="lg" />
              <div>
                <p className="text-xs text-muted-foreground">Próxima marcação</p>
                <p className="text-lg font-semibold">
                  {PUNCH_TYPE_LABELS[displayNext]}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={register.isPending}
              onClick={() => void handlePunch()}
            >
              {register.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Bater ponto
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
            <AlertDescription>
              <p>{lastResult.message}</p>
              {lastResult.locationError && geoStatus === 'denied' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRequestLocation}
                  className="mt-2"
                >
                  Tentar novamente
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
