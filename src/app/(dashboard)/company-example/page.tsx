"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users, Package, TrendingUp } from 'lucide-react';

export default function CompanyExamplePage() {
  const { isAuthenticated, api } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return; // AuthProvider fará refresh silencioso; pode iniciar nulo no SSR
    (async () => {
      try {
        const res = await api.get('/company');
        setCompany(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Erro ao carregar empresa');
      }
    })();
  }, [isAuthenticated, api]);

  useEffect(() => {
    // Redireciona para login se ficar claro que não há auth
    const t = setTimeout(() => {
      if (!isAuthenticated) router.replace('/login');
    }, 500);
    return () => clearTimeout(t);
  }, [isAuthenticated, router]);

  if (!isAuthenticated && !company) {
    return <p className="p-4">Verificando autenticação...</p>;
  }

  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!company) return <p className="p-4">Carregando...</p>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard da Empresa</h1>
        <p className="text-muted-foreground">Gerencie sua empresa e clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">
              +12.5% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45,231</div>
            <p className="text-xs text-muted-foreground">
              +8.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Dados detalhados da sua empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-muted p-4 rounded overflow-auto">{JSON.stringify(company, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
