'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ProductImage } from '@/components/products/product-image';
import type { Sale, Product, Customer } from '@/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { companyApi, customerApi } from '@/lib/api-endpoints';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, change, icon: Icon, trend = 'neutral' }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span>vs. mês anterior</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { api, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Dates for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // Sales this month
  const { data: salesData, isLoading: isSalesLoading, error: salesError } = useQuery({
    queryKey: ['sales', 'month', startOfMonth, endOfMonth],
    queryFn: async () => (await api.get('/sale', { params: { startDate: startOfMonth, endDate: endOfMonth, limit: 1000 } })).data,
    enabled: isAuthenticated,
  });

  const normalizeList = <T,>(raw: any, key?: string): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    if (key && Array.isArray(raw[key])) return raw[key] as T[];
    if (Array.isArray(raw.data)) return raw.data as T[];
    if (Array.isArray(raw.items)) return raw.items as T[];
    return [];
  };

  // Sales last 7 days (for chart)
  const start7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
  const end7 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const start7Iso = start7.toISOString();
  const end7Iso = end7.toISOString();
  const { data: last7SalesRaw } = useQuery({
    queryKey: ['sales', 'last7', start7Iso, end7Iso],
    queryFn: async () => (await api.get('/sale', { params: { startDate: start7Iso, endDate: end7Iso, limit: 1000 } })).data,
    enabled: isAuthenticated,
  });

  const last7Sales: Sale[] = normalizeList<Sale>(last7SalesRaw, 'sales');
  // Aggregate by day
  const salesByDayMap: Record<string, { total: number; count: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(start7.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    salesByDayMap[key] = { total: 0, count: 0 };
  }
  last7Sales.forEach((s) => {
    const dateKey = (s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : '').toString();
    if (!dateKey) return;
    if (!salesByDayMap[dateKey]) salesByDayMap[dateKey] = { total: 0, count: 0 };
    const revenue = (s.total || 0) - (s.change || 0);
    salesByDayMap[dateKey].total += revenue;
    salesByDayMap[dateKey].count += 1;
  });

  const salesByPeriod = Object.keys(salesByDayMap)
    .sort()
    .map((k) => {
      const d = new Date(k + 'T00:00:00');
      return {
        date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        total: Number(salesByDayMap[k].total.toFixed(2)),
        count: salesByDayMap[k].count,
      };
    });

  // Products for this company (attempt large limit)
  const { data: productsData, isLoading: isProductsLoading, error: productsError } = useQuery({
    queryKey: ['products', 'company'],
    queryFn: async () => {
      const response = (await api.get('/product', { params: { page: 1, limit: 1000 } })).data;
      return response;
    },
    enabled: isAuthenticated,
  });

  // Customers for this company
  const { data: customersData, isLoading: isCustomersLoading, error: customersError } = useQuery({
    queryKey: ['customers', 'company', user?.companyId],
    queryFn: async () => {
      const response = await customerApi.list({ 
        page: 1, 
        limit: 1000,
        companyId: user?.companyId 
      });
      return response.data || response;
    },
    enabled: isAuthenticated && !!user?.companyId,
  });

  // Companies data (only for admin)
  const { data: companiesData, isLoading: isCompaniesLoading, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await companyApi.list();
      return response.data || response || [];
    },
    enabled: isAuthenticated && user?.role === 'admin',
  });


  // Clientes com dívidas a prazo em atraso (> 30 dias)
  const { data: overdueCustomers } = useQuery({
    queryKey: ['customers-overdue', customersData],
    enabled: isAuthenticated && !!customersData,
    queryFn: async () => {
      const list = normalizeList<Customer>(customersData, 'customers');
      const results: Array<{ customer: Customer; overdueCount: number; overdueTotal: number; oldestDueDate?: string }> = [];
      const nowTs = Date.now();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

      const batchSize = 10;
      for (let i = 0; i < list.length; i += batchSize) {
        const batch = list.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (c) => {
            try {
              const resp = await api.get(`/customer/${c.id}/installments`);
              const installments = normalizeList<any>(resp.data, 'installments');
              let overdueCount = 0;
              let overdueTotal = 0;
              let oldest: string | undefined;
              installments.forEach((ins: any) => {
                const due = ins.dueDate ? new Date(ins.dueDate).getTime() : NaN;
                const isPaid = !!ins.isPaid || !!ins.paidAt;
                const amount = Number(ins.amount || ins.value || 0);
                if (!isPaid && !isNaN(due)) {
                  const overdueMs = nowTs - due;
                  if (overdueMs > THIRTY_DAYS) {
                    overdueCount += 1;
                    overdueTotal += amount;
                    if (!oldest || new Date(ins.dueDate) < new Date(oldest)) oldest = ins.dueDate;
                  }
                }
              });
              if (overdueCount > 0) {
                return { customer: c, overdueCount, overdueTotal, oldestDueDate: oldest };
              }
              return null;
            } catch {
              return null;
            }
          })
        );
        batchResults.forEach((r) => r && results.push(r));
      }

      results.sort((a, b) => b.overdueTotal - a.overdueTotal);
      return results;
    },
  });

  useEffect(() => {
    const err = salesError || productsError || customersError || companiesError;
    if (err) handleApiError(err);
  }, [salesError, productsError, customersError, companiesError]);

  useEffect(() => {
    // Se o usuário for vendedor, redireciona para /sales e não mostra o dashboard
    if (isAuthenticated && user?.role === 'vendedor') {
      router.replace('/sales');
    }
  }, [isAuthenticated, user, router]);
  // Compute sales metrics for month
  const sales: Sale[] = normalizeList<Sale>(salesData, 'sales');
  const totalSalesCount = sales.length;
  const revenueTotal = sales.reduce((acc, s) => acc + (s.total || 0) - (s.change || 0), 0);

  const products: Product[] = normalizeList<Product>(productsData, 'products');
  const customers: Customer[] = normalizeList<Customer>(customersData, 'customers');

  // Produtos vencidos ou a vencer em 5 dias
  const nowDate = new Date();
  const fiveDaysFromNow = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 5, 23, 59, 59);
  const expiringProducts: Product[] = (products || [])
    .filter((p) => !!p.expirationDate)
    .filter((p) => {
      const d = new Date(p.expirationDate as string);
      if (isNaN(d.getTime())) return false;
      return d <= fiveDaysFromNow; // inclui vencidos e próximos 5 dias
    })
    .sort((a, b) => {
      const da = new Date(a.expirationDate as string).getTime();
      const db = new Date(b.expirationDate as string).getTime();
      return da - db;
    });

  // Estoque baixo (local): stockQuantity <= minStockQuantity (ou <= 0 se min não definido)
  const lowStockList: Product[] = (products || []).filter((p) => {
    const stock = Number(p.stockQuantity ?? 0);
    const min = Number(p.minStockQuantity ?? 0);
    if (Number.isNaN(stock) || Number.isNaN(min)) return false;
    return stock <= min;
  });
  const lowStockCount = lowStockList.length;
  const lowStockPreview = lowStockList.slice(0, 5);

  useEffect(() => {
    // Debug: log produtos e lowStock para inspecionar no console do navegador
    if (!isProductsLoading) {
      // eslint-disable-next-line no-console
      console.log('[Dashboard] products count=', products.length, 'lowStockCount=', lowStockCount, 'preview=', lowStockPreview);
    }
  }, [isProductsLoading, products, lowStockCount, lowStockPreview]);

  // Compute top products from sales (this month) if API doesn't provide them
  const productMap: Record<string, { product?: Product | null; quantity: number; revenue: number }> = {};
  sales.forEach((s) => {
    (s.items || []).forEach((it) => {
      const pid = it.productId || (it.product && it.product.id) || 'unknown';
      if (!productMap[pid]) productMap[pid] = { product: it.product || null, quantity: 0, revenue: 0 };
      productMap[pid].quantity += it.quantity || 0;
      productMap[pid].revenue += (it.subtotal != null ? it.subtotal : (it.unitPrice || 0) * (it.quantity || 0));
    });
  });

  const computedTopProducts = Object.keys(productMap)
    .map((k) => ({ product: productMap[k].product || { id: k, name: 'Produto desconhecido', barcode: '', price: productMap[k].revenue, companyId: '', createdAt: '', updatedAt: '' }, quantity: productMap[k].quantity, revenue: productMap[k].revenue }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Different loading states for admin vs company
  const isAdmin = user?.role === 'admin';
  const loading = isAdmin 
    ? isCompaniesLoading 
    : isSalesLoading || isProductsLoading || isCustomersLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(isAdmin ? 2 : 4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Admin Dashboard - Simple view with company count
  if (isAdmin) {
    const companies = Array.isArray(companiesData) ? companiesData : [];
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Registradas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de empresas cadastradas no sistema
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Ativas</CardTitle>
              <CardDescription>Empresas com status ativo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {companies.filter(c => c.isActive).length}
              </div>
              <p className="text-sm text-muted-foreground">
                de {companies.length} empresas cadastradas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>


      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Vendas (mês)"
          value={totalSalesCount}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Receita (mês)"
          value={formatCurrency(revenueTotal || 0)}
          icon={DollarSign}
        />
        <MetricCard
          title="Produtos"
          value={products.length}
          icon={Package}
        />
        <MetricCard
          title="Clientes"
          value={customers.length}
          icon={Users}
        />
      </div>

      {/* Alerta local: Estoque Baixo */}
      {lowStockCount > 0 && (
        <div className="grid gap-4 md:grid-cols-1">
          <Card className="border-orange-500">
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <CardTitle>Estoque Baixo</CardTitle>
                <CardDescription>
                  {lowStockCount} produto(s) com estoque baixo
                </CardDescription>
              </div>
            </CardHeader>
            {lowStockPreview.length > 0 && (
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {lowStockPreview.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border-b py-2">
                      <div className="flex items-center gap-3">
                        <ProductImage 
                          photos={p.photos} 
                          name={p.name} 
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.barcode || '-'}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{p.stockQuantity} / {p.minStockQuantity ?? 0}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => router.push('/products')}>Ver todos</Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Charts */}
  <div className="grid gap-4 md:grid-cols-2">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Período</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={computedTopProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product.name" />
                <YAxis />
                <Tooltip formatter={(value: any, name: any, props: any) => {
                  if (name === 'quantity') return [value, 'Quantidade'];
                  return [value, name];
                }} />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Products & Customers lists */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos com validade</CardTitle>
            <CardDescription>Vencidos ou que vencem nos próximos 5 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {expiringProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum produto vencido ou a vencer</p>
              ) : (
                expiringProducts.map((p) => {
                  const d = p.expirationDate ? new Date(p.expirationDate) : null;
                  const expired = !!d && d.getTime() < nowDate.getTime();
                  // dias restantes
                  const diffDays = d ? Math.ceil((d.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  return (
                    <div key={p.id} className="flex items-center justify-between border-b py-2">
                      <div className="flex items-center gap-3">
                        <ProductImage 
                          photos={p.photos} 
                          name={p.name} 
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">Validade: {p.expirationDate ? formatDate(p.expirationDate) : '-'}</div>
                        </div>
                      </div>
                      <div className={"text-xs font-medium " + (expired ? 'text-red-600' : 'text-orange-600')}>
                        {expired ? 'Vencido' : `Vence em ${diffDays}d`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes em Atraso</CardTitle>
            <CardDescription>Parcelas vencidas há mais de 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {!overdueCustomers || overdueCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum cliente em atraso</p>
              ) : (
                overdueCustomers.map((item) => (
                  <div key={item.customer.id} className="flex items-center justify-between border-b py-2">
                    <div>
                      <div className="font-medium">{item.customer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.overdueCount} parcela(s) em atraso{item.oldestDueDate ? ` • mais antiga: ${formatDate(item.oldestDueDate)}` : ''}
                      </div>
                    </div>
                    <div className="text-sm font-medium">{formatCurrency(item.overdueTotal)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
