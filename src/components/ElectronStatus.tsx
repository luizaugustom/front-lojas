"use client";

import { useEffect, useState } from 'react';
import { isElectron, checkConnection, onConnectionStatus, syncNow } from '@/lib/electron-adapter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ElectronStatus() {
  const [isElectronApp, setIsElectronApp] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsElectronApp(isElectron());

    // Verificar status inicial de conexão
    checkConnection().then(setIsOnline);

    // Monitorar mudanças de status de conexão
    const unsubscribe = onConnectionStatus((status) => {
      setIsOnline(status.isOnline);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncNow();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isElectronApp) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-white p-3 shadow-lg">
      <Badge variant={isOnline ? 'default' : 'destructive'}>
        {isOnline ? 'Online' : 'Offline'}
      </Badge>

      {!isOnline && (
        <Button
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      )}
    </div>
  );
}

