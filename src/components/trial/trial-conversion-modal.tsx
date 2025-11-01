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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanType } from '@/types';
import { Check, X, Star, Sparkles } from 'lucide-react';

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

  const handleSubscribe = (planName: string) => {
    const phoneNumber = '+5548998482590'; // Número do WhatsApp
    const message = encodeURIComponent(`Estou interessado nos Planos Montshop`);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const plans = [
    {
      name: 'Básico',
      type: PlanType.BASIC,
      price: 'R$ 49,90',
      period: '/mês',
      features: [
        'Até 250 produtos',
        '1 vendedor',
        '5 contas a pagar',
        'Gestão de vendas',
        'Relatórios básicos',
      ],
      popular: false,
    },
    {
      name: 'Plus',
      type: PlanType.PLUS,
      price: 'R$ 99,90',
      period: '/mês',
      features: [
        'Até 800 produtos',
        '2 vendedores',
        '15 contas a pagar',
        'Tudo do Básico',
        'Suporte prioritário',
        'Recursos avançados',
      ],
      popular: true,
    },
    {
      name: 'Pro',
      type: PlanType.PRO,
      price: 'R$ 199,90',
      period: '/mês',
      features: [
        'Produtos ilimitados',
        'Vendedores ilimitados',
        'Contas ilimitadas',
        'Tudo do Plus',
        'API exclusiva',
        'Suporte 24/7',
        'Recursos premium',
      ],
      popular: false,
    },
  ];

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
            Você está aproveitando nosso plano de teste gratuito de 7 dias. Continue aproveitando
            todos os recursos Plus sem interrupções!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Atenção:</strong> Seu período de teste expira em
              breve. Para continuar usando o sistema sem interrupções, escolha um dos planos
              abaixo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mt-6">
            {plans.map((planOption) => (
              <Card
                key={planOption.type}
                className={`relative ${
                  planOption.popular
                    ? 'border-primary border-2 shadow-lg scale-105'
                    : 'border'
                }`}
              >
                {planOption.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{planOption.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{planOption.price}</span>
                    <span className="text-muted-foreground">{planOption.period}</span>
                  </div>
                  <CardDescription>Ideal para empresas em crescimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {planOption.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={planOption.popular ? 'default' : 'outline'}
                    onClick={() => {
                      handleSubscribe(planOption.name);
                    }}
                  >
                    {planOption.popular ? 'Assinar Agora' : 'Escolher Plano'}
                  </Button>
                </CardContent>
              </Card>
            ))}
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

