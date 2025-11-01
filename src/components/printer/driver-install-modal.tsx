'use client';

import { useState } from 'react';
import { Download, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DriverInfo {
  name: string;
  installed: boolean;
  version?: string;
  compatible: boolean;
}

interface DriverInstallModalProps {
  open: boolean;
  onClose: () => void;
  drivers: DriverInfo[];
  onInstall: () => Promise<void>;
  loading?: boolean;
}

export function DriverInstallModal({
  open,
  onClose,
  drivers,
  onInstall,
  loading = false,
}: DriverInstallModalProps) {
  const [installing, setInstalling] = useState(false);

  const missingDrivers = drivers.filter(d => !d.installed);
  const installedDrivers = drivers.filter(d => d.installed);
  const allInstalled = missingDrivers.length === 0;

  const handleInstall = async () => {
    try {
      setInstalling(true);
      await onInstall();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              allInstalled 
                ? 'bg-green-100 text-green-600' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {allInstalled ? (
                <CheckCircle2 size={24} />
              ) : (
                <Download size={24} />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {allInstalled ? 'Drivers Instalados' : 'Instalação de Drivers'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {allInstalled 
                  ? 'Todos os drivers necessários estão instalados' 
                  : `${missingDrivers.length} driver(s) faltando para impressoras térmicas`
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!allInstalled && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Atenção:</strong> Para instalar drivers automaticamente, pode ser necessário executar o aplicativo como Administrador.
              </AlertDescription>
            </Alert>
          )}

          {/* Drivers Faltantes */}
          {missingDrivers.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Drivers Faltantes ({missingDrivers.length})
              </h3>
              <div className="space-y-2">
                {missingDrivers.map((driver, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200"
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        {driver.version && (
                          <p className="text-xs text-muted-foreground">
                            Versão: {driver.version}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Não Instalado</Badge>
                      {!driver.compatible && (
                        <Badge variant="secondary">Incompatível</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drivers Instalados */}
          {installedDrivers.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Drivers Instalados ({installedDrivers.length})
              </h3>
              <div className="space-y-2">
                {installedDrivers.map((driver, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        {driver.version && (
                          <p className="text-xs text-muted-foreground">
                            Versão: {driver.version}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="default">Instalado</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          {!allInstalled && (
            <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
              <p className="font-semibold text-foreground">Dicas para instalação manual:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Windows: Painel de Controle → Dispositivos e Impressoras → Adicionar Impressora</li>
                <li>Use o driver "Generic / Text Only" se não encontrar específico</li>
                <li>Reinicie o computador após a instalação se necessário</li>
                <li>Execute o aplicativo como Administrador para instalação automática</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={installing}
          >
            {allInstalled ? 'Fechar' : 'Instalar Depois'}
          </Button>
          {!allInstalled && (
            <Button
              onClick={handleInstall}
              disabled={installing || loading}
              className="min-w-[140px]"
            >
              {installing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Instalando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Instalar Agora
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



