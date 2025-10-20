'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Users, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { sellerApi } from '@/lib/api-endpoints';
import { SellersTable } from '@/components/sellers/sellers-table';
import { SellerDialog } from '@/components/sellers/seller-dialog';
import { SellerDetailsDialog } from '@/components/sellers/seller-details-dialog';
import { formatCurrency } from '@/lib/utils';
import type { Seller } from '@/types';

export default function SellersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const { data: sellersResponse, isLoading, refetch } = useQuery({
    queryKey: ['sellers', search, user?.companyId],
    queryFn: async () => {
      console.log('[SellersPage] Buscando vendedores com search:', search, 'companyId:', user?.companyId);
      try {
        const response = await sellerApi.list({ 
          search,
          companyId: user?.companyId 
        });
        console.log('[SellersPage] Resposta da API:', response);
        return response;
      } catch (error) {
        console.error('[SellersPage] Erro ao buscar vendedores:', error);
        throw error;
      }
    },
    enabled: !!user?.companyId, // Só executa se tiver companyId
  });

  // A API retorna um objeto único ou array, vamos normalizar
  const sellers = Array.isArray(sellersResponse) 
    ? sellersResponse 
    : sellersResponse?.data 
    ? sellersResponse.data 
    : sellersResponse?.sellers 
    ? sellersResponse.sellers 
    : sellersResponse 
    ? [sellersResponse] 
    : [];

  // Calcular estatísticas gerais
  const totalSellers = sellers.length;
  const totalSales = sellers.reduce((sum, seller) => sum + (seller.totalSales || 0), 0);
  const totalRevenue = sellers.reduce((sum, seller) => sum + (seller.totalRevenue || 0), 0);
  const averageRevenue = totalSellers > 0 ? totalRevenue / totalSellers : 0;

  const handleEdit = (seller: Seller) => {
    setSelectedSeller(seller);
    setDialogOpen(true);
  };

  const handleView = (seller: Seller) => {
    setSelectedSeller(seller);
    setDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedSeller(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSeller(null);
    refetch();
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedSeller(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendedores</h1>
          <p className="text-muted-foreground">Gerencie os vendedores da sua empresa</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Novo Vendedor
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalSellers}</p>
              <p className="text-sm text-muted-foreground">Total de Vendedores</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalSales}</p>
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(averageRevenue)}
              </p>
              <p className="text-sm text-muted-foreground">Média por Vendedor</p>
            </div>
          </div>
        </Card>
      </div>


      {/* Filtros e Busca */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <InputWithIcon
              placeholder="Buscar por nome, email ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              iconPosition="left"
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring"
            />
          </div>
          <Button variant="outline" className="border-border text-foreground hover:bg-muted">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Tabela de Vendedores */}
      <SellersTable
        sellers={sellers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onView={handleView}
        onRefetch={refetch}
      />

      {/* Modais */}
      <SellerDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={refetch}
        seller={selectedSeller}
      />

      <SellerDetailsDialog
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        onEdit={handleEdit}
        seller={selectedSeller}
      />
    </div>
  );
}
