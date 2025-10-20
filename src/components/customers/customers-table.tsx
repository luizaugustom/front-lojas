'use client';

import { useState } from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
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
import { CustomerDeleteModal } from './customer-delete-modal';
import { formatCPFCNPJ, formatPhone } from '@/lib/utils';
import type { Customer } from '@/types';

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  onEdit: (customer: Customer) => void;
  onRefetch: () => void;
}

export function CustomersTable({ customers, isLoading, onEdit, onRefetch }: CustomersTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    onRefetch();
  };

  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setCustomerToDelete(null);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando clientes...</p>
        </div>
      </Card>
    );
  }

  if (customers.length === 0) {
    return (
      <Card className="bg-card border-border">
        <div className="p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhum cliente encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece adicionando um novo cliente.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="text-foreground">Nome</TableHead>
            <TableHead className="text-foreground">Email</TableHead>
            <TableHead className="text-foreground">Telefone</TableHead>
            <TableHead className="text-foreground">CPF/CNPJ</TableHead>
            <TableHead className="text-foreground">Cidade</TableHead>
            <TableHead className="text-right text-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="border-border hover:bg-muted/50">
              <TableCell className="font-medium text-foreground">{customer.name}</TableCell>
              <TableCell className="text-foreground">{customer.email || '-'}</TableCell>
              <TableCell className="text-foreground">{customer.phone ? formatPhone(customer.phone) : '-'}</TableCell>
              <TableCell className="text-foreground">{customer.cpfCnpj ? formatCPFCNPJ(customer.cpfCnpj) : '-'}</TableCell>
              <TableCell className="text-foreground">{customer.address?.city || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(customer)}
                    className="hover:bg-primary/10 text-primary hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(customer)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <CustomerDeleteModal
        open={deleteModalOpen}
        onClose={handleDeleteClose}
        customer={customerToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  );
}
