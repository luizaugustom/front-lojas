'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, AlertTriangle, CheckCircle2, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { InstallmentsTable } from '@/components/installments/installments-table';
import { CustomersDebtList } from '@/components/installments/customers-debt-list';
import { PaymentDialog } from '@/components/installments/payment-dialog';
import { CustomerDebtPaymentDialog } from '@/components/installments/customer-debt-payment-dialog';
import { formatCurrency } from '@/lib/utils';

type DateFilter = 'all' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-year';

export default function InstallmentsPage() {
  const { api, user } = useAuth();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [customerDebtDialogOpen, setCustomerDebtDialogOpen] = useState(false);
  const [selectedCustomerDebt, setSelectedCustomerDebt] = useState<{
    customer: any;
    totalRemaining: number;
  } | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-month');

  const isSeller = user?.role === 'vendedor';
  const isCompany = user?.role === 'empresa';

  // Calcular datas baseadas no filtro
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    switch (dateFilter) {
      case 'this-week': {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // Domingo da semana atual
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start,
          endDate: now,
        };
      }
      case 'last-week': {
        const end = new Date(now);
        end.setDate(now.getDate() - now.getDay() - 1); // Sábado da semana passada
        end.setHours(23, 59, 59, 999);
        const start = new Date(end);
        start.setDate(end.getDate() - 6); // Domingo da semana passada
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start,
          endDate: end,
        };
      }
      case 'this-month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start,
          endDate: now,
        };
      }
      case 'last-month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        return {
          startDate: start,
          endDate: end,
        };
      }
      case 'this-year': {
        const start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start,
          endDate: now,
        };
      }
      default:
        return { startDate: undefined, endDate: undefined };
    }
  }, [dateFilter]);

  // Função para filtrar parcelas: parcelas futuras sempre aparecem, parcelas do passado só se estiverem no intervalo
  const filterInstallments = (installments: any[]) => {
    if (dateFilter === 'all' || !startDate || !endDate) {
      return installments;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return installments.filter((installment) => {
      const dueDate = new Date(installment.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      // Parcelas futuras sempre aparecem
      if (dueDate > now) {
        return true;
      }

      // Parcelas do passado só aparecem se estiverem no intervalo do filtro
      // Comparar apenas as datas (sem horas)
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      return dueDateOnly >= startDateOnly && dueDateOnly <= endDateOnly;
    });
  };

  // Função para normalizar resposta da API
  const normalizeInstallments = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.installments)) return raw.installments;
    return [];
  };

  // Buscar parcelas pendentes (usado por vendedores para ver clientes com dívidas)
  const { data: pendingInstallments, isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ['installments-pending'],
    queryFn: async () => {
      const response = await api.get('/installment?isPaid=false');
      return normalizeInstallments(response.data);
    },
    enabled: !!user, // Só busca se o usuário estiver autenticado
  });

  // Para empresas: buscar todas as parcelas
  const { data: allInstallments, isLoading: allLoading, refetch: refetchAll } = useQuery({
    queryKey: ['installments-all'],
    queryFn: async () => {
      const response = await api.get('/installment');
      return normalizeInstallments(response.data);
    },
    enabled: isCompany, // Só busca se for empresa
  });

  // Para empresas: buscar parcelas vencidas
  const { data: overdueInstallments, isLoading: overdueLoading, refetch: refetchOverdue } = useQuery({
    queryKey: ['installments-overdue'],
    queryFn: async () => {
      const response = await api.get('/installment/overdue');
      return normalizeInstallments(response.data);
    },
    enabled: isCompany, // Só busca se for empresa
  });

  // Para empresas: buscar parcelas pagas
  const { data: paidInstallments, isLoading: paidLoading, refetch: refetchPaid } = useQuery({
    queryKey: ['installments-paid'],
    queryFn: async () => {
      const response = await api.get('/installment?isPaid=true');
      return normalizeInstallments(response.data);
    },
    enabled: isCompany, // Só busca se for empresa
  });

  // Para empresas: buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ['installments-stats'],
    queryFn: async () => {
      const response = await api.get('/installment/stats');
      return response.data || {};
    },
    enabled: isCompany, // Só busca se for empresa
  });

  const handlePayment = (installment: any) => {
    setSelectedInstallment(installment);
    setPaymentDialogOpen(true);
  };

  const refreshInstallmentLists = () => {
    if (isCompany) {
      refetchAll();
      refetchOverdue();
      refetchPaid();
    }
    refetchPending();
  };

  const handlePaymentClose = () => {
    setPaymentDialogOpen(false);
    setSelectedInstallment(null);
    refreshInstallmentLists();
  };

  const openCustomerDebtDialog = (customer: any, totalRemaining = 0) => {
    if (!customer) return;
    setSelectedCustomerDebt({
      customer,
      totalRemaining,
    });
    setCustomerDebtDialogOpen(true);
  };

  const handleManageCustomerDebt = (data: {
    customer: any;
    installmentCount: number;
    totalRemaining: number;
  }) => {
    openCustomerDebtDialog(data.customer, data.totalRemaining);
  };

  const handleManageCustomerDebtFromTable = (customer: any) => {
    openCustomerDebtDialog(customer);
  };

  const handleCustomerDebtDialogClose = () => {
    setCustomerDebtDialogOpen(false);
    setSelectedCustomerDebt(null);
  };

  const handleCustomerDebtPaid = () => {
    refreshInstallmentLists();
  };

  // Se for vendedor, mostrar versão simplificada
  if (isSeller) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes com Dívidas</h1>
            <p className="text-muted-foreground">Lista de clientes com pagamentos pendentes</p>
          </div>
        </div>

        <CustomersDebtList
          installments={pendingInstallments || []}
          isLoading={pendingLoading}
          onPaymentClick={handleManageCustomerDebt}
        />

        <CustomerDebtPaymentDialog
          open={customerDebtDialogOpen}
          onClose={handleCustomerDebtDialogClose}
          customer={selectedCustomerDebt?.customer}
          onPaid={handleCustomerDebtPaid}
        />

        <PaymentDialog
          open={paymentDialogOpen}
          onClose={handlePaymentClose}
          installment={selectedInstallment}
        />
      </div>
    );
  }

  // Se for empresa, mostrar versão completa
  if (isCompany) {
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2 pb-1">
              <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 py-1.5 pt-0">
              <div className="text-xl font-bold">
                {formatCurrency(stats?.totalReceivable || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingInstallments || 0} parcelas pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2 pb-1">
              <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent className="px-4 py-1.5 pt-0">
              <div className="text-xl font-bold text-destructive">
                {formatCurrency(stats?.overdueAmount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.overdueInstallments || 0} parcelas vencidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2 pb-1">
              <CardTitle className="text-sm font-medium">Parcelas em Aberto</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 py-1.5 pt-0">
              <div className="text-xl font-bold">{stats?.pendingInstallments || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtro de Data */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por vencimento:</span>
            </div>
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione um filtro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="this-week">Esta semana</SelectItem>
                <SelectItem value="last-week">Semana passada</SelectItem>
                <SelectItem value="this-month">Este mês</SelectItem>
                <SelectItem value="last-month">Mês passado</SelectItem>
                <SelectItem value="this-year">Este ano</SelectItem>
              </SelectContent>
            </Select>
            {dateFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateFilter('all')}
                className="h-8"
              >
                <X className="mr-1 h-3 w-3" />
                Limpar
              </Button>
            )}
          </div>
        </Card>

        {/* Tabs com Tabelas */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="overdue">Vencidas</TabsTrigger>
            <TabsTrigger value="paid">Pagas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <InstallmentsTable
              installments={filterInstallments(allInstallments || [])}
              isLoading={allLoading}
              onPayment={handlePayment}
              onRefetch={refetchAll}
              onManageCustomerDebt={handleManageCustomerDebtFromTable}
            />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <InstallmentsTable
              installments={filterInstallments(pendingInstallments || [])}
              isLoading={pendingLoading}
              onPayment={handlePayment}
              onRefetch={refetchPending}
              onManageCustomerDebt={handleManageCustomerDebtFromTable}
            />
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <InstallmentsTable
              installments={filterInstallments(overdueInstallments || [])}
              isLoading={overdueLoading}
              onPayment={handlePayment}
              onRefetch={refetchOverdue}
              onManageCustomerDebt={handleManageCustomerDebtFromTable}
            />
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            <InstallmentsTable
              installments={filterInstallments(paidInstallments || [])}
              isLoading={paidLoading}
              onPayment={handlePayment}
              onRefetch={refetchPaid}
              showPayButton={false}
              onManageCustomerDebt={handleManageCustomerDebtFromTable}
            />
          </TabsContent>
        </Tabs>

        <CustomerDebtPaymentDialog
          open={customerDebtDialogOpen}
          onClose={handleCustomerDebtDialogClose}
          customer={selectedCustomerDebt?.customer}
          onPaid={handleCustomerDebtPaid}
        />

        <PaymentDialog
          open={paymentDialogOpen}
          onClose={handlePaymentClose}
          installment={selectedInstallment}
        />
      </div>
    );
  }

  // Se não for vendedor nem empresa, não mostrar nada (ou redirecionar)
  return null;
}

