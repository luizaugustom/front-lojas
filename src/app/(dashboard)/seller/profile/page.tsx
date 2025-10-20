'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  Save, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { formatDate, formatCurrency } from '@/lib/utils';
import { updateSellerProfileSchema } from '@/lib/validations';
import { SellerCharts } from '@/components/sellers/seller-charts';
import type { Seller, SellerStats, Sale, UpdateSellerProfileDto } from '@/types';

export default function SellerProfilePage() {
  const { api, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdateSellerProfileDto>({
    resolver: zodResolver(updateSellerProfileSchema),
    defaultValues: {
      name: '',
      cpf: '',
      birthDate: '',
      email: '',
      phone: '',
    },
  });

  // Buscar perfil do vendedor
  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: async () => {
      try {
        const response = await api.getMyProfile();
        return response.data || response;
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        throw error;
      }
    },
  });

  // Buscar estatísticas do vendedor
  const { data: statsData, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async () => {
      try {
        const response = await api.getMyStats();
        return response.data || response;
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        throw error;
      }
    },
  });

  // Buscar vendas recentes
  const { data: salesData, isLoading: isLoadingSales, refetch: refetchSales } = useQuery({
    queryKey: ['seller-sales'],
    queryFn: async () => {
      try {
        const response = await api.getMySales({ page: 1, limit: 10 });
        return response.data || response;
      } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        throw error;
      }
    },
  });

  const profile: Seller = profileData;
  const stats: SellerStats = statsData;
  const recentSales: Sale[] = Array.isArray(salesData) ? salesData : salesData?.data || [];

  // Preencher formulário quando os dados carregarem
  useEffect(() => {
    if (profile && !isEditing) {
      reset({
        name: profile.name,
        cpf: profile.cpf || '',
        birthDate: profile.birthDate || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile, reset, isEditing]);

  const onSubmit = async (data: UpdateSellerProfileDto) => {
    setIsLoading(true);
    try {
      await api.updateMyProfile(data);
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      refetchProfile();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      reset({
        name: profile.name,
        cpf: profile.cpf || '',
        birthDate: profile.birthDate || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  };

  const handleRefresh = () => {
    refetchProfile();
    refetchStats();
    refetchSales();
  };

  // Função para aplicar máscara de CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para aplicar máscara de telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Carregando perfil...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Perfil não encontrado</h2>
        <p className="text-gray-500">Não foi possível carregar as informações do seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingProfile || isLoadingStats || isLoadingSales}
          >
            <RefreshCw className={`h-4 w-4 ${(isLoadingProfile || isLoadingStats || isLoadingSales) ? 'animate-spin' : ''}`} />
          </Button>
          {!isEditing && (
            <Button onClick={handleEdit}>
              <Edit3 className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {isLoadingStats ? '...' : stats?.totalSales || 0}
              </p>
              <p className="text-sm text-gray-600">Total de Vendas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {isLoadingStats ? '...' : formatCurrency(stats?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-gray-600">Faturamento Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {isLoadingStats ? '...' : formatCurrency(stats?.averageSaleValue || 0)}
              </p>
              <p className="text-sm text-gray-600">Ticket Médio</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Formulário de Perfil */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações Pessoais
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Login (não editável) */}
            <div>
              <Label htmlFor="login" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Login (Email)
              </Label>
              <Input
                id="login"
                value={profile.login}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Login não pode ser alterado</p>
            </div>

            {/* Nome */}
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                placeholder="João Silva"
                {...register('name')}
                disabled={!isEditing}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <Label htmlFor="cpf" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                CPF
              </Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                {...register('cpf')}
                disabled={!isEditing}
                onChange={(e) => {
                  if (isEditing) {
                    const formatted = formatCPF(e.target.value);
                    e.target.value = formatted;
                    register('cpf').onChange(e);
                  }
                }}
                className={errors.cpf ? 'border-red-500' : ''}
              />
              {errors.cpf && (
                <p className="text-sm text-red-500 mt-1">{errors.cpf.message}</p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div>
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
                disabled={!isEditing}
                className={errors.birthDate ? 'border-red-500' : ''}
              />
              {errors.birthDate && (
                <p className="text-sm text-red-500 mt-1">{errors.birthDate.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@example.com"
                {...register('email')}
                disabled={!isEditing}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                {...register('phone')}
                disabled={!isEditing}
                onChange={(e) => {
                  if (isEditing) {
                    const formatted = formatPhone(e.target.value);
                    e.target.value = formatted;
                    register('phone').onChange(e);
                  }
                }}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Gráficos de Estatísticas */}
      <SellerCharts stats={stats} isLoading={isLoadingStats} />

      {/* Vendas Recentes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Vendas Recentes
        </h3>
        {isLoadingSales ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Carregando vendas...
            </div>
          </div>
        ) : recentSales.length > 0 ? (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Venda #{sale.saleNumber}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(sale.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(sale.total)}
                  </p>
                  <div className="flex gap-1">
                    {sale.paymentMethods.map((method) => (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {method === 'cash' ? 'Dinheiro' :
                         method === 'credit_card' ? 'Cartão' :
                         method === 'debit_card' ? 'Débito' :
                         method === 'pix' ? 'PIX' : 'Parcelado'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma venda encontrada</p>
          </div>
        )}
      </Card>
    </div>
  );
}
