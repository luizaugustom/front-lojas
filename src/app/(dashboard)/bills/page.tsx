'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BillsTable } from '@/components/bills/bills-table';
import { BillDialog } from '@/components/bills/bill-dialog';
import type { BillToPay } from '@/types';

export default function BillsPage() {
  const { api } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: billsResponse, isLoading, refetch } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => (await api.get('/bill-to-pay')).data,
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

      <BillsTable bills={bills || []} isLoading={isLoading} onRefetch={refetch} />

      <BillDialog open={dialogOpen} onClose={handleClose} />
    </div>
  );
}
