'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ProductLossDialog } from '@/components/product-losses/product-loss-dialog';
import { ProductLossesTable } from '@/components/product-losses/product-losses-table';
import { formatCurrency } from '@/lib/utils';
import { PageHelpModal } from '@/components/help';
import { productLossesHelpTitle, productLossesHelpDescription, productLossesHelpIcon, getProductLossesHelpTabs } from '@/components/help/contents/product-losses-help';

interface ProductLoss {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    barcode: string;
  };
  quantity: number;
  unitCost: number;
  totalCost: number;
  reason: string;
  notes?: string;
  lossDate: string;
  seller?: {
    id: string;
    name: string;
  };
}

export default function ProductLossesPage() {
  const { api, user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const canManage = user ? user.role !== 'vendedor' : false;

  // Construir query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return params.toString();
  }, [startDate, endDate]);

  const { data: lossesResponse, isLoading, refetch } = useQuery({
    queryKey: ['product-losses', queryParams],
    queryFn: async () => {
      const url = queryParams ? `/product-losses?${queryParams}` : '/product-losses';
      return (await api.get(url)).data;
    },
  });

  const { data: summaryResponse } = useQuery({
    queryKey: ['product-losses-summary', queryParams],
    queryFn: async () => {
      const url = queryParams ? `/product-losses/summary?${queryParams}` : '/product-losses/summary';
      return (await api.get(url)).data;
    },
  });

  const losses: ProductLoss[] = lossesResponse || [];
  const summary = summaryResponse?.summary || { totalLosses: 0, totalQuantity: 0, totalCost: 0 };

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
          <h1 className="text-3xl font-bold tracking-tight">Perdas de Produtos</h1>
          <p className="text-muted-foreground">
            Registre e gerencie perdas de produtos (vencimento, quebra, etc.)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setHelpOpen(true)} aria-label="Ajuda" className="shrink-0 hover:scale-105 transition-transform">
            <HelpCircle className="h-5 w-5" />
          </Button>
          {canManage && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Perda
          </Button>
          )}
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Perdas</p>
              <p className="text-2xl font-bold">{summary.totalLosses}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Quantidade Perdida</p>
              <p className="text-2xl font-bold">{summary.totalQuantity}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <ProductLossesTable losses={losses} isLoading={isLoading} />

      {canManage && (
        <ProductLossDialog open={dialogOpen} onClose={handleClose} />
      )}
      <PageHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} title={productLossesHelpTitle} description={productLossesHelpDescription} icon={productLossesHelpIcon} tabs={getProductLossesHelpTabs()} />
    </div>
  );
}

