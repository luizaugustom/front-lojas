'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Página legada — agora redireciona para `/time-clock?tab=history`,
 * onde o conteúdo é renderizado como aba (visão pessoal do vendedor).
 */
export default function TimeClockHistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role === 'vendedor') {
      router.replace('/time-clock?tab=history');
    } else {
      // Empresa/gestor/admin usam a aba "Histórico Geral" do mesmo modo
      router.replace('/time-clock?tab=history');
    }
  }, [isAuthenticated, user?.role, router]);

  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      Redirecionando para Ponto Eletrônico...
    </div>
  );
}
