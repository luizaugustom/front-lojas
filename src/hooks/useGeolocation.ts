'use client';

import { useCallback, useEffect, useState } from 'react';

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  /** Precisão em metros */
  accuracyMeters: number;
}

export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported' | 'error';

export interface UseGeolocationResult {
  coords: GeolocationCoords | null;
  status: GeolocationStatus;
  error: string | null;
  loading: boolean;
  refresh: () => void;
}

interface Options {
  /** Tenta ler a posição imediatamente ao montar */
  autoStart?: boolean;
  /** Habilita watchPosition para atualizações contínuas */
  watch?: boolean;
  /** Timeout (ms) para getCurrentPosition */
  timeout?: number;
  /** Idade máxima do cache (ms) */
  maximumAge?: number;
  /** Habilita precisão alta */
  enableHighAccuracy?: boolean;
}

/**
 * Hook de geolocalização para captura de ponto eletrônico.
 * - Pede permissão automaticamente quando autoStart=true
 * - Suporta watch (atualizações em tempo real) e leituras pontuais
 * - Trata todos os erros de permissão/timeout/dispositivo
 */
export function useGeolocation(options: Options = {}): UseGeolocationResult {
  const {
    autoStart = true,
    watch = false,
    timeout = 15_000,
    maximumAge = 5_000,
    enableHighAccuracy = true,
  } = options;

  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      setStatus('unsupported');
      return;
    }

    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      setError('Geolocalização não é suportada neste navegador/dispositivo.');
      return;
    }

    let cancelled = false;
    let watchId: number | null = null;

    const onSuccess: PositionCallback = (pos) => {
      if (cancelled) return;
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyMeters: pos.coords.accuracy,
      });
      setStatus('granted');
      setError(null);
    };

    const onError: PositionErrorCallback = (err) => {
      if (cancelled) return;
      if (err.code === err.PERMISSION_DENIED) {
        setStatus('denied');
        setError('Permissão de localização negada pelo usuário.');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setStatus('error');
        setError('Localização indisponível no momento.');
      } else if (err.code === err.TIMEOUT) {
        setStatus('error');
        setError('Tempo esgotado ao obter localização.');
      } else {
        setStatus('error');
        setError(err.message || 'Erro desconhecido ao obter localização.');
      }
    };

    setStatus((prev) => (prev === 'granted' ? prev : 'loading'));

    if (watch) {
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    }

    return () => {
      cancelled = true;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, timeout, maximumAge, enableHighAccuracy, tick]);

  // Auto-start: se autoStart=true, dispara uma leitura ao montar
  useEffect(() => {
    if (autoStart) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    coords,
    status,
    error,
    loading: status === 'loading' || status === 'idle',
    refresh,
  };
}
