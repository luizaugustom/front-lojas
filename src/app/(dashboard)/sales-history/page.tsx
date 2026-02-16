'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Download, Eye, Filter, Printer, TrendingUp, DollarSign, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/useAuth';
import { useDateRange } from '@/hooks/useDateRange';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { SalesTable } from '@/components/sales-history/sales-table';
import { SaleDetailsDialog } from '@/components/sales-history/sale-details-dialog';
import { CancelSaleDialog } from '@/components/sales/cancel-sale-dialog';
import { saleApi } from '@/lib/api-endpoints';
import type { DataPeriodFilter } from '@/types';
import { PageHelpModal } from '@/components/help';
import { salesHistoryHelpTitle, salesHistoryHelpDescription, salesHistoryHelpIcon, getSalesHistoryHelpTabs } from '@/components/help/contents/sales-history-help';

const COMPANY_PERIOD_OPTIONS: Array<{ value: DataPeriodFilter; label: string }> = [
  { value: 'TODAY', label: 'Hoje' },
  { value: 'THIS_WEEK', label: 'Esta semana' },
  { value: 'LAST_15_DAYS', label: 'Últimos 15 dias' },
  { value: 'LAST_1_MONTH', label: 'Último mês' },
  { value: 'LAST_3_MONTHS', label: 'Últimos 3 meses' },
  { value: 'LAST_6_MONTHS', label: 'Últimos 6 meses' },
  { value: 'THIS_YEAR', label: 'Este ano' },
  { value: 'ALL', label: 'Todos os dados' },
];

const SELLER_PERIOD_OPTIONS: Array<{ value: DataPeriodFilter; label: string }> = [
  { value: 'TODAY', label: 'Hoje' },
  { value: 'LAST_1_MONTH', label: 'Último mês' },
  { value: 'LAST_3_MONTHS', label: 'Últimos 3 meses' },
];

function resolveDateRange(period: DataPeriodFilter): { startDate?: string; endDate?: string } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case 'TODAY':
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    case 'ALL': {
      const min = new Date(0);
      min.setHours(0, 0, 0, 0);
      return { startDate: min.toISOString(), endDate: end.toISOString() };
    }
    case 'THIS_YEAR':
      start.setMonth(0, 1);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    case 'LAST_6_MONTHS':
      start.setMonth(start.getMonth() - 6);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    case 'LAST_3_MONTHS':
      start.setMonth(start.getMonth() - 3);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    case 'LAST_1_MONTH':
      start.setMonth(start.getMonth() - 1);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    case 'LAST_15_DAYS':
      start.setDate(start.getDate() - 14);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    case 'THIS_WEEK': {
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1; // semana inicia segunda
      start.setDate(start.getDate() - diff);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    default:
      return {};
  }
}

export default function SalesHistoryPage() {
  const { api, user } = useAuth();
  const { queryParams, queryKeyPart, dateRange } = useDateRange();
  const [period, setPeriod] = useState<DataPeriodFilter>('THIS_YEAR');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelSaleId, setCancelSaleId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [filterClient, setFilterClient] = useState('');
  const [filterSeller, setFilterSeller] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [helpOpen, setHelpOpen] = useState(false);

  const availableOptions = useMemo(
    () => (user?.role === 'vendedor' ? SELLER_PERIOD_OPTIONS : COMPANY_PERIOD_OPTIONS),
    [user?.role],
  );

  useEffect(() => {
    const fallback: DataPeriodFilter = user?.role === 'vendedor' ? 'LAST_1_MONTH' : 'THIS_YEAR';
    const preferred = (user?.dataPeriod as DataPeriodFilter | null) ?? fallback;
    const normalized = availableOptions.some((option) => option.value === preferred) ? preferred : fallback;
    setPeriod(normalized);
  }, [availableOptions, user?.dataPeriod, user?.role]);

  // Calcular datas com base no período selecionado
  const periodRange = useMemo(() => resolveDateRange(period), [period]);
  
  // Combinar filtro global com filtro de período: usar o mais restritivo
  const { startDate, endDate } = useMemo(() => {
    const globalStart = queryParams.startDate ? new Date(queryParams.startDate) : null;
    const globalEnd = queryParams.endDate ? new Date(queryParams.endDate) : null;
    const periodStart = periodRange.startDate ? new Date(periodRange.startDate) : null;
    const periodEnd = periodRange.endDate ? new Date(periodRange.endDate) : null;
    
    // Encontrar a intersecção dos ranges
    let finalStart: Date | null = null;
    let finalEnd: Date | null = null;
    
    if (globalStart && periodStart) {
      finalStart = globalStart > periodStart ? globalStart : periodStart;
    } else {
      finalStart = globalStart || periodStart;
    }
    
    if (globalEnd && periodEnd) {
      finalEnd = globalEnd < periodEnd ? globalEnd : periodEnd;
    } else {
      finalEnd = globalEnd || periodEnd;
    }
    
    return {
      startDate: finalStart?.toISOString(),
      endDate: finalEnd?.toISOString(),
    };
  }, [periodRange, queryParams]);

  // Buscar vendas (com filtros aplicados no backend)
  const { data: salesData, isLoading, refetch } = useQuery({
    queryKey: ['sales-history', queryKeyPart, period, page, limit, startDate, endDate, filterClient, filterSeller, filterPayment],
    queryFn: async () => {
      const params: any = { page, limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // Adicionar novos filtros
      if (filterClient.trim()) {
        params.clientName = filterClient.trim();
        params.clientCpfCnpj = filterClient.trim();
      }
      if (filterSeller.trim()) {
        params.sellerId = filterSeller.trim();
      }
      if (filterPayment.trim()) {
        params.paymentMethod = filterPayment.trim();
      }

      const response = await api.get('/sale', { params });
      return response.data;
    },
  });

  // Verificar se é empresa
  const isCompany = user?.role === 'empresa';

  // Buscar estatísticas (com TODOS os filtros)
  const { data: statsData } = useQuery({
    queryKey: ['sales-stats', queryKeyPart, period, startDate, endDate, filterClient, filterSeller, filterPayment],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // Adicionar novos filtros
      if (filterClient.trim()) {
        params.clientName = filterClient.trim();
        params.clientCpfCnpj = filterClient.trim(); // Backend busca em ambos
      }
      if (filterSeller.trim()) {
        params.sellerId = filterSeller.trim(); // Nota: precisa ser ID do vendedor
      }
      if (filterPayment.trim()) {
        params.paymentMethod = filterPayment.trim();
      }

      const response = await api.get('/sale/stats', { params });
      return response.data;
    },
  });

  // Buscar lucro líquido (SOMENTE com filtros de data)
  const { data: netProfitData } = useQuery({
    queryKey: ['net-profit', queryKeyPart, period, startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/sale/net-profit', { params });
      return response.data;
    },
    enabled: isCompany, // Apenas para empresas
  });

  const sales = useMemo(() => salesData?.sales || salesData?.data || [], [salesData]);
  const total = salesData?.total || 0;
  const totalPages = salesData?.totalPages || Math.ceil(total / limit);

  const stats = {
    totalSales: statsData?.totalSales || 0,
    totalRevenue: statsData?.totalRevenue ?? statsData?.totalValue ?? 0,
    averageTicket: statsData?.averageTicket || 0,
    totalCostOfGoods: statsData?.totalCostOfGoods || 0,
  };

  // Lucro líquido vem diretamente do endpoint (apenas para empresas)
  const netProfit = isCompany ? (netProfitData?.netProfit ?? 0) : null;

  const handleViewDetails = (saleId: string) => {
    setSelectedSaleId(saleId);
    setDetailsOpen(true);
  };

  const handleCancelSale = (saleId: string) => {
    setCancelSaleId(saleId);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelSaleId) return;

    setCancelling(true);
    try {
      await saleApi.cancel(cancelSaleId, { reason });
      toast.success('Venda cancelada com sucesso!');
      setCancelDialogOpen(false);
      setCancelSaleId(null);
      refetch();
    } catch (error) {
      handleApiError(error);
    } finally {
      setCancelling(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      installment: 'Parcelado',
      store_credit: 'Crédito em Loja',
    };
    return labels[method] || method;
  };

  const handleExportSales = async () => {
    try {
      toast.loading('Gerando arquivo Excel...', { id: 'export' });

      // Buscar todas as vendas sem paginação para exportação
      const params: any = { limit: 10000 }; // Limite alto para pegar todas
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // Adicionar filtros aplicados
      if (filterClient.trim()) {
        params.clientName = filterClient.trim();
        params.clientCpfCnpj = filterClient.trim();
      }
      if (filterSeller.trim()) {
        params.sellerId = filterSeller.trim();
      }
      if (filterPayment.trim()) {
        params.paymentMethod = filterPayment.trim();
      }

      const response = await api.get('/sale', { params });
      const allSales = response.data.sales || response.data.data || [];

      const computedTotalRevenue = allSales.reduce(
        (sum: number, sale: any) => sum + Number(sale.total || 0),
        0,
      );
      const totalSalesCount = stats.totalSales || allSales.length;
      const totalRevenueForPeriod = stats.totalRevenue || computedTotalRevenue;
      const averageTicketForPeriod =
        stats.averageTicket || (totalSalesCount > 0 ? totalRevenueForPeriod / totalSalesCount : 0);

      // Criar workbook
      const workbook = XLSX.utils.book_new();

      // Aba 1: Resumo
      const summaryData = [
        ['RELATÓRIO DE VENDAS'],
        [''],
        ['Período:', availableOptions.find(p => p.value === period)?.label || 'Todos os dados'],
        ['Data de Geração:', formatDateTime(new Date().toISOString())],
        startDate ? ['Data Início:', formatDateTime(startDate)] : [],
        endDate ? ['Data Fim:', formatDateTime(endDate)] : [],
        [''],
        ['ESTATÍSTICAS'],
        ['Total de Vendas:', totalSalesCount],
        ['Receita Total:', formatCurrency(totalRevenueForPeriod)],
        ['Ticket Médio:', formatCurrency(averageTicketForPeriod)],
      ].filter(row => row.length > 0);

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Estilizar células do resumo
      summarySheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

      // Aba 2: Vendas
      const salesData: any[] = [];
      
      // Cabeçalhos
      salesData.push([
        'ID da Venda',
        'Data',
        'Cliente',
        'CPF/CNPJ',
        'Vendedor',
        'Qtd. Itens',
        'Total',
        'Troco',
        'Formas de Pagamento',
      ]);

      // Dados das vendas
      allSales.forEach((sale: any) => {
        const paymentMethods = sale.paymentMethods
          ?.map((pm: any) => `${getPaymentMethodLabel(pm.method)}: ${formatCurrency(pm.amount)}`)
          .join('; ') || '-';

        salesData.push([
          sale.id,
          formatDateTime(sale.saleDate || sale.createdAt),
          sale.clientName || 'Cliente Anônimo',
          sale.clientCpfCnpj || '-',
          sale.seller?.name || '-',
          sale.items?.length || 0,
          Number(sale.total),
          Number(sale.change || 0),
          paymentMethods,
        ]);
      });

      const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
      
      // Ajustar largura das colunas
      salesSheet['!cols'] = [
        { wch: 38 }, // ID
        { wch: 18 }, // Data
        { wch: 25 }, // Cliente
        { wch: 18 }, // CPF/CNPJ
        { wch: 20 }, // Vendedor
        { wch: 12 }, // Qtd. Itens
        { wch: 15 }, // Total
        { wch: 12 }, // Troco
        { wch: 40 }, // Formas de Pagamento
      ];

      XLSX.utils.book_append_sheet(workbook, salesSheet, 'Vendas');

      // Aba 3: Detalhes dos Itens
      const itemsData: any[] = [];
      
      // Cabeçalhos
      itemsData.push([
        'ID da Venda',
        'Data da Venda',
        'Cliente',
        'Produto',
        'Quantidade',
        'Preço Unitário',
        'Subtotal',
      ]);

      // Dados dos itens
      allSales.forEach((sale: any) => {
        if (sale.items && sale.items.length > 0) {
          sale.items.forEach((item: any) => {
            itemsData.push([
              sale.id,
              formatDateTime(sale.saleDate || sale.createdAt),
              sale.clientName || 'Cliente Anônimo',
              item.product?.name || 'Produto',
              item.quantity,
              Number(item.unitPrice),
              Number(item.totalPrice),
            ]);
          });
        }
      });

      const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
      
      // Ajustar largura das colunas
      itemsSheet['!cols'] = [
        { wch: 38 }, // ID da Venda
        { wch: 18 }, // Data
        { wch: 25 }, // Cliente
        { wch: 30 }, // Produto
        { wch: 12 }, // Quantidade
        { wch: 15 }, // Preço Unitário
        { wch: 15 }, // Subtotal
      ];

      XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Itens Vendidos');

      // Gerar arquivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Criar download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vendas-${period}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Vendas exportadas com sucesso!', { id: 'export' });
    } catch (error) {
      toast.error('Erro ao exportar vendas', { id: 'export' });
      handleApiError(error);
    }
  };

  const filteredSales = useMemo(() => {
    let list = sales as any[];

    // Filtro por cliente
    if (filterClient.trim()) {
      const q = filterClient.toLowerCase();
      list = list.filter((s) =>
        (s.clientName || '').toLowerCase().includes(q) || (s.clientCpfCnpj || '').toLowerCase().includes(q),
      );
    }

    // Filtro por vendedor
    if (filterSeller.trim()) {
      const q = filterSeller.toLowerCase();
      list = list.filter((s) => (s.seller?.name || '').toLowerCase().includes(q));
    }

    // Filtro por pagamento (qualquer método que contenha)
    if (filterPayment.trim()) {
      const q = filterPayment.toLowerCase();
      list = list.filter((s) =>
        (s.paymentMethods || []).some((pm: any) => getPaymentMethodLabel(pm.method).toLowerCase().includes(q)),
      );
    }

    // Filtro por data (intervalo específico)
    const parseDate = (d: any) => new Date(d).getTime();
    const startMillis = filterStartDate ? parseDate(filterStartDate) : null;
    const endMillis = filterEndDate ? parseDate(filterEndDate) : null;

    if (startMillis || endMillis) {
      list = list.filter((s) => {
        const saleMillis = parseDate(s.saleDate || s.createdAt);
        if (startMillis && saleMillis < startMillis) return false;
        if (endMillis) {
          // incluir fim do dia
          const endDay = new Date(filterEndDate);
          endDay.setHours(23, 59, 59, 999);
          if (saleMillis > endDay.getTime()) return false;
        }
        return true;
      });
    }

    return list;
  }, [sales, filterClient, filterSeller, filterPayment, filterStartDate, filterEndDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico de Vendas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize e gerencie todas as vendas realizadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setHelpOpen(true)} aria-label="Ajuda" className="shrink-0 hover:scale-105 transition-transform">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button onClick={handleExportSales} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Período:</span>
          </div>
          <Select value={period} onValueChange={(value) => {
            setPeriod(value as DataPeriodFilter);
            setPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            placeholder="Buscar por cliente (nome ou CPF/CNPJ)"
          />
          <Input
            value={filterSeller}
            onChange={(e) => setFilterSeller(e.target.value)}
            placeholder="Buscar por vendedor"
          />
          <Input
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            placeholder="Buscar por pagamento (ex.: PIX, Crédito)"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              placeholder="Data inicial"
            />
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              placeholder="Data final"
            />
          </div>
        </div>
      </Card>

      {/* Estatísticas - apenas para empresas */}
      {isCompany && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
                <p className="text-xl font-bold mt-1 truncate">{stats.totalSales}</p>
              </div>
              <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-xl font-bold mt-1 truncate">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="h-9 w-9 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-xl font-bold mt-1 truncate">{formatCurrency(stats.averageTicket)}</p>
              </div>
              <div className="h-9 w-9 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </Card>

          {netProfit !== null && (
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Lucro Líquido</p>
                  <p className={`text-xl font-bold mt-1 truncate ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Receita - COGS - Contas - Perdas - Juros</p>
                </div>
                <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${netProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tabela de Vendas */}
      <Card>
        <SalesTable
          sales={filteredSales}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewDetails={handleViewDetails}
          onCancelSale={user?.role === 'empresa' ? handleCancelSale : undefined}
        />
      </Card>

      {/* Dialog de Detalhes */}
      {selectedSaleId && (
        <SaleDetailsDialog
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedSaleId(null);
          }}
          saleId={selectedSaleId}
        />
      )}

      {/* Dialog de Cancelamento */}
      <CancelSaleDialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setCancelSaleId(null);
        }}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
      />
      <PageHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} title={salesHistoryHelpTitle} description={salesHistoryHelpDescription} icon={salesHistoryHelpIcon} tabs={getSalesHistoryHelpTabs()} />
    </div>
  );
}

