'use client';

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DollarSign, Search, X, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

interface CustomersDebtListProps {
  installments: any[];
  isLoading: boolean;
  onPaymentClick: (customerId: string) => void;
}

export function CustomersDebtList({
  installments,
  isLoading,
  onPaymentClick,
}: CustomersDebtListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce: aguarda 3 segundos após parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Agrupar parcelas por cliente e filtrar apenas clientes com dívidas
  const customersWithDebt = useMemo(() => {
    if (!installments || installments.length === 0) return [];

    // Filtrar apenas parcelas não pagas
    const unpaidInstallments = installments.filter((inst: any) => !inst.isPaid);

    // Agrupar por cliente
    const customerMap = new Map<string, {
      customer: any;
      installmentCount: number;
      firstUnpaidInstallment: any;
    }>();

    unpaidInstallments.forEach((installment: any) => {
      const customerId = installment.customer?.id;
      if (!customerId) return;

      const customer = installment.customer;
      const existing = customerMap.get(customerId);

      if (!existing) {
        customerMap.set(customerId, {
          customer,
          installmentCount: 1,
          firstUnpaidInstallment: installment,
        });
      } else {
        existing.installmentCount += 1;
        // Manter a primeira parcela não paga para usar no modal de pagamento
        const existingDueDate = new Date(existing.firstUnpaidInstallment.dueDate);
        const currentDueDate = new Date(installment.dueDate);
        if (currentDueDate < existingDueDate) {
          existing.firstUnpaidInstallment = installment;
        }
      }
    });

    let result = Array.from(customerMap.values());

    // Filtrar por termo de busca
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter((item) => {
        const customerName = item.customer?.name?.toLowerCase() || '';
        const customerCpfCnpj = item.customer?.cpfCnpj?.toLowerCase() || '';
        return customerName.includes(searchLower) || customerCpfCnpj.includes(searchLower);
      });
    }

    // Ordenar por nome do cliente
    result.sort((a, b) => {
      const nameA = a.customer?.name || '';
      const nameB = b.customer?.name || '';
      return nameA.localeCompare(nameB);
    });

    return result;
  }, [installments, debouncedSearchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  if (!installments || installments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <User className="h-12 w-12 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Nenhum cliente com dívidas</h3>
          <p className="text-sm text-muted-foreground">
            Não há clientes com dívidas pendentes no momento.
          </p>
        </div>
      </Card>
    );
  }

  if (searchTerm && debouncedSearchTerm && customersWithDebt.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <Search className="h-12 w-12 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Nenhum cliente encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Não foram encontrados clientes com dívidas para "{debouncedSearchTerm}".
          </p>
          <Button variant="outline" size="sm" onClick={clearSearch} className="mt-2">
            <X className="mr-1 h-4 w-4" />
            Limpar busca
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Barra de busca */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome do cliente ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
            style={{ paddingLeft: '2.5rem' }}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-muted-foreground">
            {searchTerm !== debouncedSearchTerm ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                Buscando por "{searchTerm}"...
              </span>
            ) : debouncedSearchTerm ? (
              `${customersWithDebt.length} cliente(s) encontrado(s) para "${debouncedSearchTerm}"`
            ) : null}
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Parcelas Pendentes</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customersWithDebt.map((item) => (
            <TableRow key={item.customer.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{item.customer.name}</span>
                  {item.customer.cpfCnpj && (
                    <span className="text-xs text-muted-foreground">
                      {item.customer.cpfCnpj}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{item.installmentCount}</span>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => onPaymentClick(item.firstUnpaidInstallment.id)}
                >
                  <DollarSign className="mr-1 h-4 w-4" />
                  Realizar Pagamento
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

