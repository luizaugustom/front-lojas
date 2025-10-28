'use client';

import { useEffect, useState } from 'react';
import { PlanUsageStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Package, Users, FileText, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { PlanLimitsBadge } from './plan-limits-badge';

export function PlanUsageCard() {
  const [usage, setUsage] = useState<PlanUsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await api.get('/company/plan-usage');
      setUsage(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de uso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Uso do Plano</CardTitle>
          <PlanLimitsBadge plan={usage.plan} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Produtos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Produtos</span>
            </div>
            <span className="text-muted-foreground">
              {usage.usage.products.current} / {usage.usage.products.max || '∞'}
            </span>
          </div>
          {usage.usage.products.max && (
            <>
              <Progress 
                value={usage.usage.products.percentage} 
                className="h-2"
              />
              {usage.usage.products.percentage >= 80 && (
                <div className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    {usage.usage.products.percentage >= 90 
                      ? 'Limite quase atingido!' 
                      : 'Aproximando do limite'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Vendedores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Vendedores</span>
            </div>
            <span className="text-muted-foreground">
              {usage.usage.sellers.current} / {usage.usage.sellers.max || '∞'}
            </span>
          </div>
          {usage.usage.sellers.max && (
            <>
              <Progress 
                value={usage.usage.sellers.percentage} 
                className="h-2"
              />
              {usage.usage.sellers.percentage >= 80 && (
                <div className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    {usage.usage.sellers.percentage >= 90 
                      ? 'Limite quase atingido!' 
                      : 'Aproximando do limite'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Contas a Pagar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Contas a Pagar</span>
            </div>
            <span className="text-muted-foreground">
              {usage.usage.billsToPay.current} / {usage.usage.billsToPay.max || '∞'}
            </span>
          </div>
          {usage.usage.billsToPay.max && (
            <>
              <Progress 
                value={usage.usage.billsToPay.percentage} 
                className="h-2"
              />
              {usage.usage.billsToPay.percentage >= 80 && (
                <div className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    {usage.usage.billsToPay.percentage >= 90 
                      ? 'Limite quase atingido!' 
                      : 'Aproximando do limite'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

