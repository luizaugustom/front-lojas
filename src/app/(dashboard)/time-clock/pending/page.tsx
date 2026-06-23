'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Página legada — agora redireciona para `/time-clock?tab=pending`.
 */
export default function TimeClockPendingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/time-clock?tab=pending');
  }, [router]);
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      Redirecionando para Ponto Eletrônico...
    </div>
  );
}
