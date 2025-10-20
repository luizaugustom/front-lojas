'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Lock, Unlock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { CashClosure } from '@/types';

export default function CashClosurePage() {
  const { api } = useAuth();
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [closingBalance, setClosingBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const { data: currentClosure, isLoading, refetch } = useQuery<CashClosure | null>({
    queryKey: ['current-cash-closure'],
    queryFn: async () => {
      try {
        const response = await api.get('/cash-closure/current');
        console.log('[CashClosure] Dados recebidos:', response.data);
        console.log('[CashClosure] Opening Balance:', response.data?.openingBalance);
        return response.data;
      } catch (error) {
        console.error('[CashClosure] Erro ao buscar dados:', error);
        return null;
      }
    },
  });

  const handleOpenCashClosure = async () => {
    setLoading(true);
    try {
      await api.post('/cash-closure', { openingAmount: openingBalance });
      toast.success('Caixa aberto com sucesso!');
      refetch();
      setOpeningBalance(0);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCashClosure = async () => {
    if (!currentClosure) return;
    
    setLoading(true);
    try {
  await api.patch('/cash-closure/close', { closingBalance });
      toast.success('Caixa fechado com sucesso!');
      refetch();
      setClosingBalance(0);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fechamento de Caixa</h1>
        <p className="text-muted-foreground">Gerencie a abertura e fechamento do caixa</p>
      </div>

      {!currentClosure ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5" />
              Abrir Caixa
            </CardTitle>
            <CardDescription>Informe o saldo inicial para abrir o caixa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Saldo Inicial</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            <Button onClick={handleOpenCashClosure} disabled={loading} className="w-full">
              {loading ? 'Abrindo...' : 'Abrir Caixa'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(currentClosure.openingBalance || currentClosure.openingAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor inicial do caixa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(currentClosure.totalSales || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dinheiro</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(currentClosure.totalCash || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cartão</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency((currentClosure.totalCard || 0) + (currentClosure.totalPix || 0))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Fechar Caixa
              </CardTitle>
              <CardDescription>
                Caixa aberto em {formatDateTime(currentClosure.openedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="closingBalance">Saldo Final</Label>
                <Input
                  id="closingBalance"
                  type="number"
                  step="0.01"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(Number(e.target.value))}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
              <Button onClick={handleCloseCashClosure} disabled={loading} className="w-full">
                {loading ? 'Fechando...' : 'Fechar Caixa'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
