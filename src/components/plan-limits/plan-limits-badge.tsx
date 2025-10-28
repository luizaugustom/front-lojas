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
      case PlanType.BASIC:
        return {
          label: 'Basic',
          icon: Star,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        };
      case PlanType.PLUS:
        return {
          label: 'Plus',
          icon: Zap,
          className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        };
      case PlanType.PRO:
        return {
          label: 'Pro',
          icon: Crown,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
      default:
        return {
          label: 'Basic',
          icon: Star,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
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

