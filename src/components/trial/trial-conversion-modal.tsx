'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlanType } from '@/types';
import { Sparkles } from 'lucide-react';

interface TrialConversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PlanType;
}

export function TrialConversionModal({ open, onOpenChange, plan }: TrialConversionModalProps) {
  useEffect(() => {
    if (open && plan === PlanType.TRIAL_7_DAYS) {
      // Verificar se o usuário já escolheu não mostrar hoje
      const hideUntil = localStorage.getItem('trialModalHideUntil');
      if (hideUntil) {
        const hideUntilDate = new Date(hideUntil);
        const now = new Date();
        if (hideUntilDate > now) {
          onOpenChange(false);
          return;
        }
      }
    }
  }, [open, plan, onOpenChange]);

  const handleDontShowToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem('trialModalHideUntil', tomorrow.toISOString());
    onOpenChange(false);
  };


  // Não há mais planos para mostrar, apenas teste grátis ou PRO

  if (plan !== PlanType.TRIAL_7_DAYS) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Seu período de teste está ativo! 🎉</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Você está aproveitando nosso plano de teste gratuito de 7 dias. As empresas são sempre
            plano Pro ou teste grátis, e as limitações são configuradas diretamente na empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Informação:</strong> Seu período de teste está
              ativo. As empresas são sempre plano Pro ou teste grátis, e todas as limitações são
              configuradas diretamente na empresa pelo administrador.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <Button variant="ghost" onClick={handleDontShowToday} className="text-xs">
            Não mostrar hoje
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continuar com o teste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

