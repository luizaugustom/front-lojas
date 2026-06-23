'use client';

import { QrCodeDisplay } from '@/components/time-clock/QrCodeDisplay';
import { TimeClockConfigForm } from '@/components/time-clock/TimeClockConfigForm';

export default function TimeClockQrPage() {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">QR Code da Loja</h1>
        <p className="text-sm text-muted-foreground">
          Imprima e cole em local visível para os funcionários baterem ponto.
        </p>
      </div>

      <QrCodeDisplay />

      <TimeClockConfigForm />
    </div>
  );
}
