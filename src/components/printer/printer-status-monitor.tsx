'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { printerApi } from '@/lib/api-endpoints';
import { useRouter } from 'next/navigation';

interface PrinterStatus {
  id: string;
  name: string;
  isConnected: boolean;
  paperStatus: string;
  lastStatusCheck: string | null;
}

export function PrinterStatusMonitor() {
  const [printers, setPrinters] = useState<PrinterStatus[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar apenas uma vez ao montar o componente
    checkPrinters();
  }, []);

  const checkPrinters = async () => {
    try {
      const response = await printerApi.list();
      const printerList = response.data || [];
      setPrinters(printerList);
      
      // Mostra alerta se houver problemas
      const hasIssues = printerList.some(
        (p: PrinterStatus) => !p.isConnected || p.paperStatus === 'EMPTY' || p.paperStatus === 'ERROR'
      );
      
      if (hasIssues && !dismissed) {
        setShowAlert(true);
      } else if (!hasIssues) {
        setShowAlert(false);
        setDismissed(false);
      }
    } catch (error) {
      console.error('[PrinterMonitor] Erro ao verificar impressoras:', error);
    }
  };

  const handleDismiss = () => {
    setShowAlert(false);
    setDismissed(true);
    // Re-habilita alerta após 5 minutos
    setTimeout(() => setDismissed(false), 5 * 60 * 1000);
  };

  const handleGoToSettings = () => {
    router.push('/printers');
  };

  if (!showAlert || printers.length === 0) {
    return null;
  }

  const offlinePrinters = printers.filter(p => !p.isConnected);
  const paperIssues = printers.filter(p => p.paperStatus === 'EMPTY' || p.paperStatus === 'LOW');
  const errorPrinters = printers.filter(p => p.paperStatus === 'ERROR');

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <strong>Atenção: Problema com Impressoras</strong>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <AlertDescription className="space-y-2">
              {offlinePrinters.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Printer className="h-4 w-4" />
                  <span>{offlinePrinters.length} impressora(s) offline</span>
                </div>
              )}
              
              {paperIssues.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{paperIssues.length} impressora(s) sem papel ou papel baixo</span>
                </div>
              )}
              
              {errorPrinters.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorPrinters.length} impressora(s) com erro</span>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-background"
                  onClick={checkPrinters}
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Atualizar
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleGoToSettings}
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Gerenciar
                </Button>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}


