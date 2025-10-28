'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Download, Eye, Filter, Printer, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
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

type PeriodFilter = 'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'all';

interface PeriodOption {
  value: PeriodFilter;
  label: string;
  days?: number;
}

const periodOptions: PeriodOption[] = [
  { value: 'today', label: 'Hoje', days: 0 },
  { value: 'week', label: 'Última Semana', days: 7 },
  { value: 'month', label: 'Último Mês', days: 30 },
  { value: '3months', label: 'Últimos 3 Meses', days: 90 },
  { value: '6months', label: 'Últimos 6 Meses', days: 180 },
  { value: 'year', label: 'Último Ano', days: 365 },
  { value: 'all', label: 'Todas', days: undefined },
];

export default function SalesHistoryPage() {
  const { api, user } = useAuth();
  const [period, setPeriod] = useState<PeriodFilter>('today');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Calcular datas com base no período selecionado
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const selectedPeriod = periodOptions.find(p => p.value === period);
    
    if (!selectedPeriod || selectedPeriod.days === undefined) {
      // Todas as vendas
      return { startDate: undefined, endDate: undefined };
    }

    const start = new Date();
    if (selectedPeriod.days === 0) {
      // Hoje
      start.setHours(0, 0, 0, 0);
    } else {
      // Subtrair dias
      start.setDate(start.getDate() - selectedPeriod.days);
      start.setHours(0, 0, 0, 0);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [period]);

  // Buscar vendas
  const { data: salesData, isLoading, refetch } = useQuery({
    queryKey: ['sales-history', period, page, limit, startDate, endDate],
    queryFn: async () => {
      const params: any = { page, limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/sale', { params });
      return response.data;
    },
  });

  // Buscar estatísticas
  const { data: statsData } = useQuery({
    queryKey: ['sales-stats', period, startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/sale/stats', { params });
      return response.data;
    },
  });

  const sales = salesData?.sales || salesData?.data || [];
  const total = salesData?.total || 0;
  const totalPages = salesData?.totalPages || Math.ceil(total / limit);

  const stats = {
    totalSales: statsData?.totalSales || 0,
    totalRevenue: statsData?.totalRevenue || 0,
    averageTicket: statsData?.averageTicket || 0,
  };

  const handleViewDetails = (saleId: string) => {
    setSelectedSaleId(saleId);
    setDetailsOpen(true);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      installment: 'Parcelado',
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

      const response = await api.get('/sale', { params });
      const allSales = response.data.sales || response.data.data || [];

      // Criar workbook
      const workbook = XLSX.utils.book_new();

      // Aba 1: Resumo
      const summaryData = [
        ['RELATÓRIO DE VENDAS'],
        [''],
        ['Período:', periodOptions.find(p => p.value === period)?.label || 'Todas'],
        ['Data de Geração:', formatDateTime(new Date().toISOString())],
        startDate ? ['Data Início:', formatDateTime(startDate)] : [],
        endDate ? ['Data Fim:', formatDateTime(endDate)] : [],
        [''],
        ['ESTATÍSTICAS'],
        ['Total de Vendas:', stats.totalSales],
        ['Receita Total:', formatCurrency(stats.totalRevenue)],
        ['Ticket Médio:', formatCurrency(stats.averageTicket)],
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
        <Button onClick={handleExportSales} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Período:</span>
          </div>
          <Select value={period} onValueChange={(value) => {
            setPeriod(value as PeriodFilter);
            setPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold mt-2">{stats.totalSales}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(stats.averageTicket)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela de Vendas */}
      <Card>
        <SalesTable
          sales={sales}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewDetails={handleViewDetails}
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
    </div>
  );
}

