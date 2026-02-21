'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeftRight, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { managerApi, productApi, stockTransferApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency } from '@/lib/utils';

export default function StockTransferPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fromCompanyId, setFromCompanyId] = useState('');
  const [toCompanyId, setToCompanyId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: companiesData } = useQuery({
    queryKey: ['manager', 'my-companies'],
    queryFn: () => managerApi.myCompanies().then((r) => r.data),
    enabled: user?.role === 'gestor',
  });
  const companies = Array.isArray(companiesData) ? companiesData : [];

  const { data: productsData } = useQuery({
    queryKey: ['products', 'company', fromCompanyId],
    queryFn: () => productApi.list({ companyId: fromCompanyId, page: 1, limit: 500 }).then((r) => r.data),
    enabled: !!fromCompanyId && user?.role === 'gestor',
  });
  const products = (productsData as any)?.products ?? (Array.isArray(productsData) ? productsData : []);

  const { data: transfersData, isLoading: transfersLoading } = useQuery({
    queryKey: ['stock-transfer', 'list'],
    queryFn: () => stockTransferApi.list({ page: 1, limit: 30 }).then((r) => r.data),
    enabled: user?.role === 'gestor',
  });
  const transfers = (transfersData as any)?.data ?? [];
  const pagination = (transfersData as any)?.pagination;

  const selectedProduct = products.find((p: any) => p.id === productId);
  const qty = parseInt(quantity, 10);
  const canSubmit =
    fromCompanyId &&
    toCompanyId &&
    productId &&
    !isNaN(qty) &&
    qty >= 1 &&
    fromCompanyId !== toCompanyId &&
    selectedProduct &&
    (selectedProduct.stockQuantity ?? 0) >= qty;

  const handleTransfer = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await stockTransferApi.create({
        fromCompanyId,
        toCompanyId,
        productId,
        quantity: qty,
      });
      toast.success('Transferência realizada com sucesso');
      setQuantity('');
      setProductId('');
      queryClient.invalidateQueries({ queryKey: ['stock-transfer'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'company', fromCompanyId] });
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'gestor') {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Acesso restrito ao perfil Gestor (multilojas).</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transferência de estoque</h1>
        <p className="text-muted-foreground">Mover produtos entre lojas que você gerencia</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Nova transferência
          </CardTitle>
          <CardDescription>Selecione a loja de origem, a loja de destino, o produto e a quantidade.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Loja de origem</Label>
              <Select value={fromCompanyId} onValueChange={(v) => { setFromCompanyId(v); setProductId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.fantasyName || c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Loja de destino</Label>
              <Select value={toCompanyId} onValueChange={setToCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {companies.filter((c: any) => c.id !== fromCompanyId).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.fantasyName || c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Produto (origem)</Label>
              <Select value={productId} onValueChange={setProductId} disabled={!fromCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loja de origem primeiro" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — estoque: {p.stockQuantity ?? 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  Disponível: {selectedProduct.stockQuantity ?? 0}
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleTransfer} disabled={!canSubmit || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
            {submitting ? 'Transferindo...' : 'Transferir'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de transferências</CardTitle>
          <CardDescription>Últimas transferências realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {transfersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transfers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma transferência ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Data</th>
                    <th className="text-left py-2">Origem</th>
                    <th className="text-left py-2">Destino</th>
                    <th className="text-left py-2">Produto</th>
                    <th className="text-right py-2">Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t: any) => (
                    <tr key={t.id} className="border-b">
                      <td className="py-2">{new Date(t.transferredAt).toLocaleString('pt-BR')}</td>
                      <td className="py-2">{t.fromCompany?.fantasyName || t.fromCompany?.name || t.fromCompanyId}</td>
                      <td className="py-2">{t.toCompany?.fantasyName || t.toCompany?.name || t.toCompanyId}</td>
                      <td className="py-2">{t.product?.name || t.productId}</td>
                      <td className="text-right py-2">{t.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
