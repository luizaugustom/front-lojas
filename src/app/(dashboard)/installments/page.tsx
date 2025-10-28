'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { InstallmentsTable } from '@/components/installments/installments-table';
import { PaymentDialog } from '@/components/installments/payment-dialog';
import { formatCurrency } from '@/lib/utils';

export default function InstallmentsPage() {
  const { api, user } = useAuth();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);

  // Protege rota: apenas empresa deve ver
  useEffect(() => {
    if (user && user.role !== 'empresa') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Buscar todas as parcelas
  const { data: allInstallments, isLoading: allLoading, refetch: refetchAll } = useQuery({
    queryKey: ['installments-all'],
    queryFn: async () => {
      const response = await api.get('/installment');
      return response.data || [];
    },
  });

  // Buscar parcelas pendentes
  const { data: pendingInstallments, isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ['installments-pending'],
    queryFn: async () => {
      const response = await api.get('/installment?isPaid=false');
      return response.data || [];
    },
  });

  // Buscar parcelas vencidas
  const { data: overdueInstallments, isLoading: overdueLoading, refetch: refetchOverdue } = useQuery({
    queryKey: ['installments-overdue'],
    queryFn: async () => {
      const response = await api.get('/installment/overdue');
      return response.data || [];
    },
  });

  // Buscar parcelas pagas
  const { data: paidInstallments, isLoading: paidLoading, refetch: refetchPaid } = useQuery({
    queryKey: ['installments-paid'],
    queryFn: async () => {
      const response = await api.get('/installment?isPaid=true');
      return response.data || [];
    },
  });

  // Buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ['installments-stats'],
    queryFn: async () => {
      const response = await api.get('/installment/stats');
      return response.data || {};
    },
  });

  const handlePayment = (installment: any) => {
    setSelectedInstallment(installment);
    setPaymentDialogOpen(true);
  };

  const handlePaymentClose = () => {
    setPaymentDialogOpen(false);
    setSelectedInstallment(null);
    refetchAll();
    refetchPending();
    refetchOverdue();
    refetchPaid();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos a Prazo</h1>
          <p className="text-muted-foreground">Gerencie parcelas e pagamentos dos clientes</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalReceivable || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingInstallments || 0} parcelas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(stats?.overdueAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.overdueInstallments || 0} parcelas vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parcelas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInstallments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.paidInstallments || 0} pagas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Tabelas */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({allInstallments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes ({pendingInstallments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Vencidas ({overdueInstallments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Pagas ({paidInstallments?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <InstallmentsTable
            installments={allInstallments || []}
            isLoading={allLoading}
            onPayment={handlePayment}
            onRefetch={refetchAll}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <InstallmentsTable
            installments={pendingInstallments || []}
            isLoading={pendingLoading}
            onPayment={handlePayment}
            onRefetch={refetchPending}
          />
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <InstallmentsTable
            installments={overdueInstallments || []}
            isLoading={overdueLoading}
            onPayment={handlePayment}
            onRefetch={refetchOverdue}
          />
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          <InstallmentsTable
            installments={paidInstallments || []}
            isLoading={paidLoading}
            onPayment={handlePayment}
            onRefetch={refetchPaid}
            showPayButton={false}
          />
        </TabsContent>
      </Tabs>

      <PaymentDialog
        open={paymentDialogOpen}
        onClose={handlePaymentClose}
        installment={selectedInstallment}
      />
    </div>
  );
}

