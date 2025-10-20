'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { X, User, Mail, Phone, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { createSellerSchema, updateSellerSchema } from '@/lib/validations';
import { sellerApi } from '@/lib/api-endpoints';
import type { Seller, CreateSellerDto, UpdateSellerDto } from '@/types';

interface SellerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  seller?: Seller | null;
}

export function SellerDialog({ isOpen, onClose, onSuccess, seller }: SellerDialogProps) {
  const { api } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!seller;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateSellerDto | UpdateSellerDto>({
    resolver: zodResolver(isEditing ? updateSellerSchema : createSellerSchema),
    defaultValues: {
      login: '',
      password: '',
      name: '',
      cpf: '',
      birthDate: '',
      email: '',
      phone: '',
    },
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (seller && isOpen) {
      reset({
        name: seller.name,
        cpf: seller.cpf || '',
        birthDate: seller.birthDate || '',
        email: seller.email || '',
        phone: seller.phone || '',
      });
    } else if (!seller && isOpen) {
      reset({
        login: '',
        password: '',
        name: '',
        cpf: '',
        birthDate: '',
        email: '',
        phone: '',
      });
    }
  }, [seller, isOpen, reset]);

  const onSubmit = async (data: CreateSellerDto | UpdateSellerDto) => {
    setIsLoading(true);
    try {
      const payload = { ...data };
      
      // Converter data para ISO 8601 se preenchida
      if (payload.birthDate && payload.birthDate !== '') {
        const date = new Date(payload.birthDate);
        payload.birthDate = date.toISOString();
      }

      if (isEditing) {
        await sellerApi.update(seller!.id, payload);
        toast.success('Vendedor atualizado com sucesso!');
      } else {
        await sellerApi.create(payload);
        toast.success('Vendedor criado com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                {isEditing ? 'Editar Vendedor' : 'Novo Vendedor'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isEditing ? 'Atualize as informações do vendedor' : 'Preencha os dados do novo vendedor'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Login (apenas na criação) */}
            {!isEditing && (
              <div className="md:col-span-2">
                <Label htmlFor="login" className="flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4" />
                  Login (Email) *
                </Label>
                <Input
                  id="login"
                  type="email"
                  placeholder="vendedor@empresa.com"
                  {...register('login')}
                  className={`text-foreground ${errors.login ? 'border-destructive' : ''}`}
                />
                {errors.login && (
                  <p className="text-sm text-destructive mt-1">{errors.login.message}</p>
                )}
              </div>
            )}

            {/* Senha (apenas na criação) */}
            {!isEditing && (
              <div className="md:col-span-2">
                <Label htmlFor="password" className="text-foreground">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  {...register('password')}
                  className={`text-foreground ${errors.password ? 'border-destructive' : ''}`}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Nome */}
            <div className="md:col-span-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                placeholder="João Silva"
                {...register('name')}
                className={`text-foreground ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <Label htmlFor="cpf" className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-4 w-4" />
                CPF
              </Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                {...register('cpf')}
                onChange={(e) => {
                  const formatted = formatCPF(e.target.value);
                  e.target.value = formatted;
                  register('cpf').onChange(e);
                }}
                className={`text-foreground ${errors.cpf ? 'border-destructive' : ''}`}
              />
              {errors.cpf && (
                <p className="text-sm text-destructive mt-1">{errors.cpf.message}</p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div>
              <Label htmlFor="birthDate" className="flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4" />
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
                className={`text-foreground ${errors.birthDate ? 'border-destructive' : ''}`}
              />
              {errors.birthDate && (
                <p className="text-sm text-destructive mt-1">{errors.birthDate.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@example.com"
                {...register('email')}
                className={`text-foreground ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                {...register('phone')}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  e.target.value = formatted;
                  register('phone').onChange(e);
                }}
                className={`text-foreground ${errors.phone ? 'border-destructive' : ''}`}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditing ? 'Atualizando...' : 'Criando...'}
                </div>
              ) : (
                isEditing ? 'Atualizar Vendedor' : 'Criar Vendedor'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}