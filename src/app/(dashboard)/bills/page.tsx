'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { BillsTable } from '@/components/bills/bills-table';
import { BillDialog } from '@/components/bills/bill-dialog';
import type { BillToPay } from '@/types';

type DateFilter = 'all' | 'this-week' | 'next-week' | 'next-month' | 'this-year';

export default function BillsPage() {
  const { api } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Calcular datas baseadas no filtro
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case 'this-week': {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // Domingo da semana atual
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Sábado da semana atual
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        };
      }
      case 'next-week': {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 7); // Próximo domingo
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Próximo sábado
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        };
      }
      case 'next-month': {
        const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        };
      }
      case 'this-year': {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        };
      }
      default:
        return { startDate: undefined, endDate: undefined };
    }
  }, [dateFilter]);

  // Construir query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return params.toString();
  }, [startDate, endDate]);

  const { data: billsResponse, isLoading, refetch } = useQuery({
    queryKey: ['bills', queryParams],
    queryFn: async () => {
      const url = queryParams ? `/bill-to-pay?${queryParams}` : '/bill-to-pay';
      return (await api.get(url)).data;
    },
  });

  const bills = billsResponse?.bills || [];

  const handleCreate = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas contas e despesas</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

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
              <SelectItem value="next-week">Próxima semana</SelectItem>
              <SelectItem value="next-month">Próximo mês</SelectItem>
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

      <BillsTable bills={bills || []} isLoading={isLoading} onRefetch={refetch} />

      <BillDialog open={dialogOpen} onClose={handleClose} />
    </div>
  );
}
