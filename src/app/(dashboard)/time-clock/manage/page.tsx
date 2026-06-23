'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Página legada — agora redireciona para `/time-clock?tab=history`
 * (a aba "Histórico Geral" para perfis de empresa/gestor/admin).
 */
export default function TimeClockManagePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace('/time-clock?tab=history');
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      Redirecionando para Ponto Eletrônico...
    </div>
  );
}
