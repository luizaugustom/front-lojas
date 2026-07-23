'use client';

import {
  MapPin,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistance } from './format';
import type { TimeClockConfig } from '@/types';
import type {
  GeolocationCoords,
  GeolocationStatus,
} from '@/hooks/useGeolocation';

interface Props {
  config?: TimeClockConfig | null;
  coords: GeolocationCoords | null;
  status: GeolocationStatus;
  error: string | null;
  loading: boolean;
  /** Pede novamente a localização (o navegador pode reabrir o prompt se já não tiver decisão permanente) */
  onRefresh: () => void;
  /** Opcional: faz scroll para este card quando o pai recebe erro de geolocalização */
  cardRef?: React.Ref<HTMLDivElement>;
}

// Haversine local (cópia leve do util do backend para evitar acoplamento)
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_000; // metros
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function LocationPrompt({
  config,
  coords,
  status,
  error,
  loading,
  onRefresh,
  cardRef,
}: Props) {
  const distanceM =
    coords && config
      ? haversineDistance(
          coords.latitude,
          coords.longitude,
          Number(config.latitude),
          Number(config.longitude),
        )
      : null;

  const needsPermission = config?.requireLocation && !coords && !loading;
  const showDeniedHelp =
    status === 'denied' || (error && /permissão|permission|denied/i.test(error));

  return (
    <Card ref={cardRef}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Localização</span>
            {status === 'granted' && coords && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                OK
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
            )}
            Atualizar
          </Button>
        </div>

        {needsPermission && !showDeniedHelp && (
          <div className="rounded-md bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 p-3 space-y-2">
            <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
              Permita a localização para registrar o ponto
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-300 opacity-90">
              Ao clicar em <strong>Atualizar</strong>, o navegador vai pedir sua
              autorização. Para desativar depois, use o ícone de cadeado na barra
              de endereço.
            </p>
          </div>
        )}

        {showDeniedHelp && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-700 dark:text-red-400" />
            <div className="space-y-1 text-xs text-red-700 dark:text-red-300">
              <p className="font-medium">Permissão de localização negada</p>
              <p className="opacity-90">
                Para registrar o ponto com geolocalização, libere o acesso no
                navegador:
              </p>
              <ul className="list-decimal ml-4 space-y-0.5 mt-1 opacity-90">
                <li>
                  Clique no ícone de <strong>cadeado</strong> (ou informações)
                  ao lado da URL.
                </li>
                <li>
                  Encontre <strong>Localização</strong> e selecione{' '}
                  <strong>Permitir</strong>.
                </li>
                <li>
                  Volte aqui e clique em <strong>Atualizar</strong>.
                </li>
              </ul>
              <Button
                size="sm"
                variant="outline"
                onClick={onRefresh}
                className="mt-2 h-7 text-xs"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {status === 'unsupported' && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Seu navegador não suporta geolocalização.</p>
          </div>
        )}

        {status === 'error' && error && !showDeniedHelp && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {loading && !coords && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {coords && (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latitude</span>
              <span className="font-mono">{coords.latitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Longitude</span>
              <span className="font-mono">{coords.longitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precisão</span>
              <span>±{Math.round(coords.accuracyMeters)}m</span>
            </div>
            {config && distanceM !== null && (
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground">Distância da loja</span>
                <span
                  className={`font-medium flex items-center gap-1 ${
                    distanceM <= config.radiusMeters
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {distanceM <= config.radiusMeters && (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  {formatDistance(distanceM)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
