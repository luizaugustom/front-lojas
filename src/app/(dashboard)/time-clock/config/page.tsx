'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Página legada — agora redireciona para `/time-clock?tab=config`.
 */
export default function TimeClockConfigPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/time-clock?tab=config');
  }, [router]);
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      Redirecionando para Ponto Eletrônico...
    </div>
  );
}
