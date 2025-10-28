'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { customerApi } from '@/lib/api-endpoints';
import { CustomersTable } from '@/components/customers/customers-table';
import { CustomerDialog } from '@/components/customers/customer-dialog';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customersResponse, isLoading, refetch, error } = useQuery({
    queryKey: ['customers', search, user?.companyId],
    queryFn: async () => {
      console.log('[CustomersPage] Buscando clientes com search:', search, 'companyId:', user?.companyId);
      console.log('[CustomersPage] Usuário completo:', user);
      try {
        const response = await customerApi.list({
          search,
          companyId: user?.companyId ?? undefined
        });
        console.log('[CustomersPage] Resposta da API:', response);
        return response;
      } catch (error) {
        console.error('[CustomersPage] Erro ao buscar clientes:', error);
        throw error;
      }
    },
    enabled: !!user?.companyId, // Só executa se tiver companyId
  });

  // Log adicional para debug
  console.log('[CustomersPage] Estado da query:', {
    isLoading,
    hasData: !!customersResponse,
    hasError: !!error,
    userCompanyId: user?.companyId,
    userRole: user?.role,
    enabled: !!user?.companyId
  });

  const customers = (customersResponse?.data?.customers || customersResponse?.data || []) as any[];

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedCustomer(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes</p>
        </div>
        {/** Não mostrar botão para usuários do tipo 'vendedor' */}
        {/** useAuth fornece o user e seu role */}
        {(() => {
          const { user } = useAuth();
          if (user?.role === 'vendedor') return null;
          return (
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          );
        })()}
      </div>

      <Card className="p-4 bg-card border-border">
        <InputWithIcon
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
          iconPosition="left"
          className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring"
        />
      </Card>

      {/* Debug info - remover após corrigir o problema */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="text-destructive">
            <h3 className="font-semibold">Erro ao carregar clientes:</h3>
            <p className="text-sm mt-1">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
            <p className="text-xs mt-2 opacity-75">
              CompanyId: {user?.companyId || 'Não definido'} | 
              Role: {user?.role || 'Não definido'}
            </p>
          </div>
        </Card>
      )}

      <CustomersTable
        customers={customers || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onRefetch={refetch}
      />

      <CustomerDialog
        open={dialogOpen}
        onClose={handleClose}
        customer={selectedCustomer}
      />
    </div>
  );
}
