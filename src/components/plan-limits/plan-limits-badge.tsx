'use client';

import { PlanType } from '@/types';
import { Crown, Zap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlanLimitsBadgeProps {
  plan: PlanType;
  className?: string;
}

export function PlanLimitsBadge({ plan, className = '' }: PlanLimitsBadgeProps) {
  const getPlanConfig = () => {
    switch (plan) {
      case PlanType.PRO:
        return {
          label: 'Pro',
          icon: Crown,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
      case PlanType.TRIAL_7_DAYS:
        return {
          label: 'Teste Grátis',
          icon: Zap,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
      default:
        return {
          label: 'Pro',
          icon: Crown,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
    }
  };

  const config = getPlanConfig();
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1.5 px-2.5 py-1`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{config.label}</span>
    </Badge>
  );
}

