'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Loader2, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Html5Qrcode } from 'html5-qrcode';
import { cn } from '@/lib/utils';

interface Props {
  onScan: (token: string) => void;
  onClose?: () => void;
  /** ID do container onde o scanner será renderizado */
  containerId?: string;
  className?: string;
}

type State = 'idle' | 'starting' | 'scanning' | 'error' | 'success';

export function QrScanner({
  onScan,
  onClose,
  containerId = 'qr-scanner-container',
  className,
}: Props) {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stop = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch {
      // ignore
    }
    scannerRef.current = null;
    setState('idle');
  };

  const start = async () => {
    setError(null);
    if (typeof window === 'undefined') return;
    if (!navigator?.mediaDevices) {
      setError('Câmera não disponível neste dispositivo.');
      setState('error');
      return;
    }
    setState('starting');
    try {
      const el = document.getElementById(containerId);
      if (!el) {
        setError('Container do scanner não encontrado.');
        setState('error');
        return;
      }
      const scanner = new Html5Qrcode(containerId, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setState('success');
          onScan(decodedText);
          void stop();
        },
        () => {
          // falhas intermitentes são normais; não mostrar erro
        },
      );
      setState('scanning');
    } catch (e: any) {
      setError(e?.message || 'Não foi possível iniciar a câmera.');
      setState('error');
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="text-sm font-medium">QR Code da Loja</span>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {state === 'idle' || state === 'error' ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <CameraOff className="h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              {error || 'Aponte a câmera para o QR Code impresso na loja.'}
            </p>
            <Button onClick={start} size="sm">
              <Camera className="h-4 w-4 mr-1" />
              Iniciar câmera
            </Button>
          </div>
        ) : state === 'starting' ? (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Iniciando câmera...
          </div>
        ) : state === 'success' ? (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            QR lido com sucesso!
          </div>
        ) : (
          <div className="relative">
            <div
              id={containerId}
              ref={containerRef}
              className="w-full max-w-sm mx-auto rounded overflow-hidden bg-black aspect-square"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={stop}
              className="mt-2 w-full"
            >
              Parar leitura
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
