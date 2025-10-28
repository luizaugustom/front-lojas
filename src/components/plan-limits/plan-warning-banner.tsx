'use client';

import { useEffect, useState } from 'react';
import { PlanWarnings } from '@/types';
import { AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function PlanWarningBanner() {
  const [warnings, setWarnings] = useState<PlanWarnings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadWarnings();
  }, []);

  const loadWarnings = async () => {
    try {
      const response = await api.get('/company/plan-warnings');
      setWarnings(response.data);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  if (!warnings || !warnings.nearLimit || dismissed) return null;

  return (
    <div className="mb-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
            Atenção: Limites do Plano
          </h3>
          <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
            {warnings.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-yellow-700 dark:text-yellow-400">
            Considere fazer upgrade do seu plano para continuar usando todos os recursos sem interrupções.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

