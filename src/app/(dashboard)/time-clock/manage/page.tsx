'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Página legada — redireciona para `/time-clock?tab=manage`.
 */
export default function TimeClockManagePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace('/time-clock?tab=manage');
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      Redirecionando para Ponto Eletrônico...
    </div>
  );
}
