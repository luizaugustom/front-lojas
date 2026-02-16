'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, AlertTriangle, CheckCircle2, Filter, X, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
import { useDateRange } from '@/hooks/useDateRange';
import { InstallmentsTable } from '@/components/installments/installments-table';
import { CustomersDebtList } from '@/components/installments/customers-debt-list';
import { PaymentDialog } from '@/components/installments/payment-dialog';
import { CustomerDebtPaymentDialog } from '@/components/installments/customer-debt-payment-dialog';
import { formatCurrency } from '@/lib/utils';
import { useDeviceStore } from '@/store/device-store';
import toast from 'react-hot-toast';
import { PageHelpModal } from '@/components/help';
import { installmentsHelpTitle, installmentsHelpDescription, installmentsHelpIcon, getInstallmentsHelpTabs } from '@/components/help/contents/installments-help';

type DateFilter = 'all' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-year';

export default function InstallmentsPage() {
  const { api, user } = useAuth();
  const { dateRange, queryKeyPart } = useDateRange();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [customerDebtDialogOpen, setCustomerDebtDialogOpen] = useState(false);
  const [selectedCustomerDebt, setSelectedCustomerDebt] = useState<{
    customer: any;
    totalRemaining: number;
  } | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-month');
  const [lastScanned, setLastScanned] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

  const {
    barcodeBuffer,
    setBarcodeBuffer,
    scanSuccess,
    setScanSuccess,
    scannerActive,
    setScannerActive,
  } = useDeviceStore();

  const isSeller = user?.role === 'vendedor';
  const isCompany = user?.role === 'empresa';

  // Calcular datas baseadas no filtro da página
  const pageDateRange = useMemo(() => {
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

  // Combinar filtro global com filtro da página para filtrar no frontend
  const { startDate, endDate } = useMemo(() => {
    const globalStart = dateRange.startDate;
    const globalEnd = dateRange.endDate;
    const pageStart = pageDateRange.startDate;
    const pageEnd = pageDateRange.endDate;
    
    // Encontrar a intersecção dos ranges
    let finalStart: Date | undefined = undefined;
    let finalEnd: Date | undefined = undefined;
    
    if (globalStart && pageStart) {
      finalStart = globalStart > pageStart ? globalStart : pageStart;
    } else {
      finalStart = globalStart || pageStart;
    }
    
    if (globalEnd && pageEnd) {
      finalEnd = globalEnd < pageEnd ? globalEnd : pageEnd;
    } else {
      finalEnd = globalEnd || pageEnd;
    }
    
    return { startDate: finalStart, endDate: finalEnd };
  }, [pageDateRange, dateRange]);

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
    queryKey: ['installments-pending', queryKeyPart],
    queryFn: async () => {
      const response = await api.get('/installment?isPaid=false');
      return normalizeInstallments(response.data);
    },
    enabled: !!user, // Só busca se o usuário estiver autenticado
  });

  // Para empresas: buscar todas as parcelas
  const { data: allInstallments, isLoading: allLoading, refetch: refetchAll } = useQuery({
    queryKey: ['installments-all', queryKeyPart],
    queryFn: async () => {
      const response = await api.get('/installment');
      return normalizeInstallments(response.data);
    },
    enabled: isCompany, // Só busca se for empresa
  });

  // Para empresas: buscar parcelas vencidas
  const { data: overdueInstallments, isLoading: overdueLoading, refetch: refetchOverdue } = useQuery({
    queryKey: ['installments-overdue', queryKeyPart],
    queryFn: async () => {
      const response = await api.get('/installment/overdue');
      return normalizeInstallments(response.data);
    },
    enabled: isCompany, // Só busca se for empresa
  });

  // Para empresas: buscar parcelas pagas
  const { data: paidInstallments, isLoading: paidLoading, refetch: refetchPaid } = useQuery({
    queryKey: ['installments-paid', queryKeyPart],
    queryFn: async () => {
      const response = await api.get('/installment?isPaid=true');
      return normalizeInstallments(response.data);
    },
    enabled: isCompany, // Só busca se for empresa
  });

  // Para empresas: buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ['installments-stats', queryKeyPart],
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

  // Função para buscar parcela por código de barras
  const handleBarcodeScanned = useCallback(async (barcode: string) => {
    try {
      const response = await api.get(`/installment/barcode/${barcode}`);
      const installment = response.data;

      if (installment) {
        // Abrir modal de pagamento automaticamente
        setSelectedInstallment(installment);
        setPaymentDialogOpen(true);
        setScanSuccess(true);
        setTimeout(() => setScanSuccess(false), 1200);
        toast.success(`Parcela encontrada: ${installment.installmentNumber}/${installment.totalInstallments}`);
      }
    } catch (error: any) {
      console.error('Erro ao buscar parcela por código de barras:', error);
      if (error.response?.status === 404) {
        toast.error('Parcela não encontrada com este código de barras');
      } else {
        toast.error('Erro ao buscar parcela');
      }
    }
  }, [api, setScanSuccess]);

  // Leitura de código de barras
  useEffect(() => {
    let isMounted = true;

    if (!scannerActive && isMounted) {
      setScannerActive(true);
    }

    const scanStartedAtRef = { current: null as number | null };

    const onKey = (e: KeyboardEvent) => {
      if (!e.key || !isMounted) return;

      if (e.key === 'Enter') {
        const code = barcodeBuffer.trim();
        if (code.length >= 3) {
          const startedAt = scanStartedAtRef.current ?? Date.now();
          const duration = Date.now() - startedAt;
          const avgPerChar = duration / Math.max(1, code.length);
          const isLikelyScanner = avgPerChar < 80;

          const now = Date.now();
          if (isLikelyScanner && now - lastScanned > 500 && isMounted) {
            console.log('[Installments Barcode Scanner] Código escaneado:', code);
            handleBarcodeScanned(code);
            setLastScanned(now);
          }
        }
        if (isMounted) {
          setBarcodeBuffer('');
        }
        scanStartedAtRef.current = null;
      } else if (e.key.length === 1 && isMounted) {
        if (!barcodeBuffer) {
          scanStartedAtRef.current = Date.now();
        }
        setBarcodeBuffer((s) => {
          const newBuffer = s + e.key;
          return newBuffer.length > 50 ? newBuffer.slice(-50) : newBuffer;
        });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      isMounted = false;
      window.removeEventListener('keydown', onKey);
      // Usar uma função para verificar se ainda está montado antes de atualizar estado
      setTimeout(() => {
        // Não atualizar estado se o componente foi desmontado
      }, 0);
    };
  }, [barcodeBuffer, lastScanned, scannerActive, setScannerActive, setBarcodeBuffer, handleBarcodeScanned]);

  // Se for vendedor, mostrar versão simplificada
  if (isSeller) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes com Dívidas</h1>
            <p className="text-muted-foreground">Lista de clientes com pagamentos pendentes</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setHelpOpen(true)} aria-label="Ajuda" className="shrink-0 hover:scale-105 transition-transform">
            <HelpCircle className="h-5 w-5" />
          </Button>
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
        <PageHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} title={installmentsHelpTitle} description={installmentsHelpDescription} icon={installmentsHelpIcon} tabs={getInstallmentsHelpTabs()} />
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
          <Button variant="outline" size="icon" onClick={() => setHelpOpen(true)} aria-label="Ajuda" className="shrink-0 hover:scale-105 transition-transform">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total a Receber</p>
                <p className="text-xl font-bold mt-1 truncate">
                  {formatCurrency(stats?.totalReceivable || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats?.pendingInstallments || 0} parcelas pendentes
                </p>
              </div>
              <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Atrasados</p>
                <p className="text-xl font-bold text-destructive mt-1 truncate">
                  {formatCurrency(stats?.overdueAmount || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats?.overdueInstallments || 0} parcelas vencidas
                </p>
              </div>
              <div className="h-9 w-9 shrink-0 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Parcelas em Aberto</p>
                <p className="text-xl font-bold mt-1 truncate">{stats?.pendingInstallments || 0}</p>
              </div>
              <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
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
        <PageHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} title={installmentsHelpTitle} description={installmentsHelpDescription} icon={installmentsHelpIcon} tabs={getInstallmentsHelpTabs()} />
      </div>
    );
  }

  // Se não for vendedor nem empresa, não mostrar nada (ou redirecionar)
  return null;
}

