'use client';

import { TimeClockConfigForm } from '@/components/time-clock/TimeClockConfigForm';

export default function TimeClockConfigPage() {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Configuração de Ponto Eletrônico</h1>
        <p className="text-sm text-muted-foreground">
          Defina o local da loja, raio de tolerância, requisitos e regras de
          notificação.
        </p>
      </div>

      <TimeClockConfigForm />
    </div>
  );
}
