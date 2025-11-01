'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { X, User, Mail, Phone, Calendar, CreditCard, Wallet, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
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
    control,
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
      commissionRate: 0,
      hasIndividualCash: false,
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
        password: '',
        commissionRate: seller.commissionRate || 0,
        hasIndividualCash: seller.hasIndividualCash || false,
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
        commissionRate: 0,
        hasIndividualCash: false,
      });
    }
  }, [seller, isOpen, reset]);

  const onSubmit = async (data: CreateSellerDto | UpdateSellerDto) => {
    setIsLoading(true);
    try {
      const payload = { ...data };
      
      // Remover confirmPassword do payload (não é enviado para o backend)
      delete (payload as any).confirmPassword;
      
      // Se estiver editando e a senha estiver vazia, remove do payload
      if (isEditing && (payload as any).password !== undefined && ((payload as any).password === '' || !(payload as any).password)) {
        delete (payload as any).password;
      }
      
      // Tratar data de nascimento
      if (payload.birthDate && payload.birthDate !== '') {
        // Converter data para ISO 8601 se preenchida
        const date = new Date(payload.birthDate);
        payload.birthDate = date.toISOString();
      } else if (isEditing && (!payload.birthDate || payload.birthDate === '')) {
        // Se estiver editando e a data estiver vazia, não enviar o campo
        delete payload.birthDate;
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
                  className={`text-foreground ${(errors as any).login ? 'border-destructive' : ''}`}
                />
                {(errors as any).login && (
                  <p className="text-sm text-destructive mt-1">{(errors as any).login.message}</p>
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
                  className={`text-foreground ${(errors as any).password ? 'border-destructive' : ''}`}
                />
                {(errors as any).password && (
                  <p className="text-sm text-destructive mt-1">{(errors as any).password.message}</p>
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
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                    placeholder="Selecione a data de nascimento"
                  />
                )}
              />
              {errors.birthDate && (
                <p className="text-sm text-destructive mt-1">{errors.birthDate.message}</p>
              )}
            </div>

            {/* Comissão */}
            <div>
              <Label htmlFor="commissionRate" className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-4 w-4" />
                Comissão (%)
              </Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0.00"
                {...register('commissionRate', { valueAsNumber: true })}
                onFocus={(e) => {
                  if (Number(e.target.value) === 0) {
                    e.target.value = '';
                  }
                }}
                className={`text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.commissionRate ? 'border-destructive' : ''}`}
              />
              {errors.commissionRate && (
                <p className="text-sm text-destructive mt-1">{errors.commissionRate?.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Taxa de comissão sobre vendas (0-100%)
              </p>
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

            {/* Senha (apenas na edição - opcional) */}
            {isEditing && (
              <>
                <div className="md:col-span-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-foreground">
                    <Lock className="h-4 w-4" />
                    Nova Senha (opcional)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Deixe em branco para não alterar"
                    {...register('password')}
                    className={`text-foreground ${(errors as any).password ? 'border-destructive' : ''}`}
                  />
                  {(errors as any).password && (
                    <p className="text-sm text-destructive mt-1">{(errors as any).password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe em branco se não quiser alterar a senha
                  </p>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-foreground">
                    <Lock className="h-4 w-4" />
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    {...(register as any)('confirmPassword')}
                    className={`text-foreground ${(errors as any).confirmPassword ? 'border-destructive' : ''}`}
                  />
                  {(errors as any).confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{(errors as any).confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Caixa Individual */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3 flex-1">
                  <Wallet className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="hasIndividualCash" className="text-foreground font-medium cursor-pointer">
                      Caixa Individual
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Se ativado, este vendedor terá seu próprio caixa separado. Se desativado, usará o caixa compartilhado da empresa.
                    </p>
                  </div>
                </div>
                <Controller
                  name="hasIndividualCash"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="hasIndividualCash"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
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