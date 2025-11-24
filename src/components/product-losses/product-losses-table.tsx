'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ProductLoss {
  id: string;
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

interface ProductLossesTableProps {
  losses: ProductLoss[];
  isLoading: boolean;
}

export function ProductLossesTable({ losses, isLoading }: ProductLossesTableProps) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">Carregando...</p>
      </Card>
    );
  }

  if (losses.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">Nenhuma perda registrada</p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Custo Unit.</TableHead>
            <TableHead>Custo Total</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead>Vendedor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {losses.map((loss) => (
            <TableRow key={loss.id}>
              <TableCell>{formatDate(loss.lossDate)}</TableCell>
              <TableCell className="font-medium">{loss.product.name}</TableCell>
              <TableCell>{loss.product.barcode}</TableCell>
              <TableCell>{loss.quantity}</TableCell>
              <TableCell>{formatCurrency(loss.unitCost)}</TableCell>
              <TableCell className="font-semibold text-red-600">
                {formatCurrency(loss.totalCost)}
              </TableCell>
              <TableCell>{loss.reason}</TableCell>
              <TableCell>{loss.notes || '-'}</TableCell>
              <TableCell>{loss.seller?.name || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

