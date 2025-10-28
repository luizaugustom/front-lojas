'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { SellerStats } from '@/types';

interface SellerChartsProps {
  stats: SellerStats | null;
  isLoading: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function SellerCharts({ stats, isLoading }: SellerChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Carregando gráficos...</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Carregando gráficos...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats || !stats.salesByPeriod || stats.salesByPeriod.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vendas por Período</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        </Card>
      </div>
    );
  }

  // Preparar dados para o gráfico de vendas por período
  const salesData = stats.salesByPeriod.map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    }),
    vendas: item.total,
    faturamento: item.revenue,
  }));

  // Preparar dados para o gráfico de produtos mais vendidos
  const productsData = stats.topProducts.map((product, index) => ({
    name: product.productName.length > 15 
      ? product.productName.substring(0, 15) + '...' 
      : product.productName,
    quantidade: product.quantity,
    faturamento: product.revenue,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Vendas por Período */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Vendas por Período</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'vendas' ? value : formatCurrency(Number(value)),
                  name === 'vendas' ? 'Vendas' : 'Faturamento'
                ]}
                labelStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="vendas" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Gráfico de Produtos Mais Vendidos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={productsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, quantidade }) => `${name}: ${quantidade}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {productsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [
                  name === 'quantidade' ? value : formatCurrency(Number(value)),
                  name === 'quantidade' ? 'Quantidade' : 'Faturamento'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Gráfico de Linha - Faturamento */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Evolução do Faturamento</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']}
                labelStyle={{ fontSize: 12 }}
              />
              <Line 
                type="monotone" 
                dataKey="faturamento" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}


