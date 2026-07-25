'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Página legada — redireciona para Configurações > Ponto Eletrônico (QR).
 */
export default function TimeClockQrPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/settings/ponto?section=qr');
  }, [router]);
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      Redirecionando para Configurações...
    </div>
  );
}
