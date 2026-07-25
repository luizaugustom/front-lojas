'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Página legada — redireciona para Configurações > Ponto Eletrônico.
 */
export default function TimeClockConfigPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/settings/ponto');
  }, [router]);
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      Redirecionando para Configurações...
    </div>
  );
}
