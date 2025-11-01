'use client';

import { useState, useEffect } from 'react';
import { Company, CreateCompanyDto, PlanType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Phone, Mail, Hash, MapPin, CreditCard, FileText, Palette, Crown, Zap, Star, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSave: (data: CreateCompanyDto) => void;
}

export function CompanyDialog({ open, onOpenChange, company, onSave }: CompanyDialogProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: '',
    login: '',
    password: '',
    cnpj: '',
    email: '',
    phone: '',
    stateRegistration: '',
    municipalRegistration: '',
    plan: PlanType.BASIC,
    logoUrl: '',
    brandColor: '#3B82F6',
    zipCode: '',
    state: '',
    city: '',
    district: '',
    street: '',
    number: '',
    complement: '',
    beneficiaryName: '',
    beneficiaryCpfCnpj: '',
    bankCode: '',
    bankName: '',
    agency: '',
    accountNumber: '',
    accountType: 'corrente',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        login: company.login || company.email, // Usar login da empresa, ou email como fallback
        password: '', // Não mostrar senha existente
        cnpj: company.cnpj,
        email: company.email,
        phone: company.phone || '',
        stateRegistration: '',
        municipalRegistration: '',
        plan: company.plan || PlanType.BASIC,
        logoUrl: '',
        brandColor: company.brandColor || '#3B82F6',
        zipCode: '',
        state: '',
        city: '',
        district: '',
        street: '',
        number: '',
        complement: '',
        beneficiaryName: '',
        beneficiaryCpfCnpj: '',
        bankCode: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'corrente',
      });
    } else {
      setFormData({
        name: '',
        login: '',
        password: '',
        cnpj: '',
        email: '',
        phone: '',
        stateRegistration: '',
        municipalRegistration: '',
        plan: PlanType.BASIC,
        logoUrl: '',
        brandColor: '#3B82F6',
        zipCode: '',
        state: '',
        city: '',
        district: '',
        street: '',
        number: '',
        complement: '',
        beneficiaryName: '',
        beneficiaryCpfCnpj: '',
        bankCode: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'corrente',
      });
    }
  }, [company, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação do telefone
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      if (!phoneRegex.test(formData.phone)) {
        alert('Telefone deve estar no formato (XX) XXXXX-XXXX');
        return;
      }
    }

    // Validação do email no login (aplicar sempre que o login for fornecido)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.login && formData.login.trim() && !emailRegex.test(formData.login.trim())) {
      alert('Login deve ser um email válido');
      return;
    }

    setLoading(true);
    try {
      const dataToSave: CreateCompanyDto = {
        name: formData.name.trim(),
        login: formData.login.trim(),
        cnpj: formData.cnpj,
        email: formData.email.trim(),
        phone: formData.phone || undefined,
        brandColor: formData.brandColor,
        // Only include password if it's not empty (required for creation, optional for update)
        ...(formData.password && formData.password.trim() && { password: formData.password.trim() }),
        ...(formData.stateRegistration && { stateRegistration: formData.stateRegistration.trim() }),
        ...(formData.municipalRegistration && { municipalRegistration: formData.municipalRegistration.trim() }),
        ...(formData.plan && { plan: formData.plan }),
        ...(formData.logoUrl && { logoUrl: formData.logoUrl.trim() }),
        ...(formData.zipCode && formData.zipCode.includes('-') && { zipCode: formData.zipCode }),
        ...(formData.state && { state: formData.state.trim() }),
        ...(formData.city && { city: formData.city.trim() }),
        ...(formData.district && { district: formData.district.trim() }),
        ...(formData.street && { street: formData.street.trim() }),
        ...(formData.number && { number: formData.number.trim() }),
        ...(formData.complement && { complement: formData.complement.trim() }),
        ...(formData.beneficiaryName && { beneficiaryName: formData.beneficiaryName.trim() }),
        ...(formData.beneficiaryCpfCnpj && { beneficiaryCpfCnpj: formData.beneficiaryCpfCnpj }),
        ...(formData.bankCode && { bankCode: formData.bankCode.trim() }),
        ...(formData.bankName && { bankName: formData.bankName.trim() }),
        ...(formData.agency && { agency: formData.agency.trim() }),
        ...(formData.accountNumber && { accountNumber: formData.accountNumber.trim() }),
        ...(formData.accountType && { accountType: formData.accountType }),
      };
      await onSave(dataToSave);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateCompanyDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    }
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const formatCEP = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="h-5 w-5" />
            {company ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
                    <Building2 className="h-4 w-4" />
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nome da empresa"
                    required
                    className="text-foreground"
                  />
                </div>

                {/* Login - Exibir na criação ou edição (se admin) */}
                {(!company || (company && isAdmin)) && (
                  <div className="md:col-span-2">
                    <Label htmlFor="login" className="flex items-center gap-2 text-foreground">
                      <User className="h-4 w-4" />
                      Login (Email) {!company && '*'}
                    </Label>
                    <Input
                      id="login"
                      type="email"
                      value={formData.login}
                      onChange={(e) => handleChange('login', e.target.value)}
                      placeholder="login@empresa.com"
                      required={!company}
                      className="text-foreground"
                    />
                    {company && isAdmin && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Edite o login de acesso da empresa
                      </p>
                    )}
                  </div>
                )}

                {/* Senha - Exibir na criação ou edição (se admin) */}
                {(!company || (company && isAdmin)) && (
                  <div className="md:col-span-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-foreground">
                      <Lock className="h-4 w-4" />
                      Senha {!company && '*'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder={company ? "Deixe em branco para manter a senha atual" : "Mínimo 6 caracteres"}
                      required={!company}
                      className="text-foreground"
                    />
                    {company && isAdmin && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Preencha apenas se desejar alterar a senha
                      </p>
                    )}
                  </div>
                )}

                {/* CNPJ */}
                <div>
                  <Label htmlFor="cnpj" className="flex items-center gap-2 text-foreground">
                    <Hash className="h-4 w-4" />
                    CNPJ *
                  </Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    required
                    maxLength={18}
                    className="text-foreground"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contato@empresa.com"
                    required
                    className="text-foreground"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="text-foreground"
                  />
                </div>

                {/* Plano */}
                <div>
                  <Label htmlFor="plan" className="flex items-center gap-2 text-foreground">
                    <Crown className="h-4 w-4" />
                    Plano
                  </Label>
                  <select
                    id="plan"
                    value={formData.plan}
                    onChange={(e) => handleChange('plan', e.target.value as PlanType)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                  >
                    <option value={PlanType.BASIC}>Basic</option>
                    <option value={PlanType.PLUS}>Plus</option>
                    <option value={PlanType.PRO}>Pro</option>
                    <option value={PlanType.TRIAL_7_DAYS}>Teste Grátis (7 dias)</option>
                  </select>
                </div>

                {/* Inscrição Estadual */}
                <div>
                  <Label htmlFor="stateRegistration" className="text-foreground">
                    Inscrição Estadual
                  </Label>
                  <Input
                    id="stateRegistration"
                    value={formData.stateRegistration}
                    onChange={(e) => handleChange('stateRegistration', e.target.value)}
                    placeholder="000.000.000.000"
                    className="text-foreground"
                  />
                </div>

                {/* Inscrição Municipal */}
                <div>
                  <Label htmlFor="municipalRegistration" className="text-foreground">
                    Inscrição Municipal
                  </Label>
                  <Input
                    id="municipalRegistration"
                    value={formData.municipalRegistration}
                    onChange={(e) => handleChange('municipalRegistration', e.target.value)}
                    placeholder="000000000"
                    className="text-foreground"
                  />
                </div>

                {/* Cor da Marca */}
                <div>
                  <Label htmlFor="brandColor" className="flex items-center gap-2 text-foreground">
                    <Palette className="h-4 w-4" />
                    Cor da Marca
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="brandColor"
                      type="color"
                      value={formData.brandColor}
                      onChange={(e) => handleChange('brandColor', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.brandColor}
                      onChange={(e) => handleChange('brandColor', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1 text-foreground"
                    />
                  </div>
                </div>

                {/* Logomarca */}
                <div className="md:col-span-2">
                  <Label htmlFor="logo" className="text-foreground">Logomarca</Label>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formDataFile = new FormData();
                      formDataFile.append('file', file);
                      try {
                        const response = await fetch('/api/upload/single?subfolder=company-logos', {
                          method: 'POST',
                          body: formDataFile,
                        });
                        const result = await response.json();
                        if (result.fileUrl) {
                          setFormData(prev => ({ ...prev, logoUrl: result.fileUrl }));
                        }
                      } catch (err) {
                        console.error('Erro ao enviar logomarca', err);
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                  {formData.logoUrl && (
                    <div className="mt-2">
                      <img src={formData.logoUrl} alt="Logomarca" className="h-16 rounded" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CEP */}
                <div>
                  <Label htmlFor="zipCode" className="text-foreground">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', formatCEP(e.target.value))}
                    placeholder="00000-000"
                    maxLength={9}
                    className="text-foreground"
                  />
                </div>

                {/* Estado */}
                <div>
                  <Label htmlFor="state" className="text-foreground">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="UF"
                    className="text-foreground"
                  />
                </div>

                {/* Cidade */}
                <div>
                  <Label htmlFor="city" className="text-foreground">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Nome da cidade"
                    className="text-foreground"
                  />
                </div>

                {/* Bairro */}
                <div>
                  <Label htmlFor="district" className="text-foreground">Bairro</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    placeholder="Nome do bairro"
                    className="text-foreground"
                  />
                </div>

                {/* Rua */}
                <div>
                  <Label htmlFor="street" className="text-foreground">Rua</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    placeholder="Nome da rua"
                    className="text-foreground"
                  />
                </div>

                {/* Número */}
                <div>
                  <Label htmlFor="number" className="text-foreground">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => handleChange('number', e.target.value)}
                    placeholder="123"
                    className="text-foreground"
                  />
                </div>

                {/* Complemento */}
                <div className="md:col-span-2">
                  <Label htmlFor="complement" className="text-foreground">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => handleChange('complement', e.target.value)}
                    placeholder="Apto, sala, etc."
                    className="text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Bancários */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5" />
                Dados Bancários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome do Beneficiário */}
                <div className="md:col-span-2">
                  <Label htmlFor="beneficiaryName" className="text-foreground">Nome do Beneficiário</Label>
                  <Input
                    id="beneficiaryName"
                    value={formData.beneficiaryName}
                    onChange={(e) => handleChange('beneficiaryName', e.target.value)}
                    placeholder="Nome completo"
                    className="text-foreground"
                  />
                </div>

                {/* CPF/CNPJ do Beneficiário */}
                <div>
                  <Label htmlFor="beneficiaryCpfCnpj" className="text-foreground">CPF/CNPJ do Beneficiário</Label>
                  <Input
                    id="beneficiaryCpfCnpj"
                    value={formData.beneficiaryCpfCnpj}
                    onChange={(e) => handleChange('beneficiaryCpfCnpj', e.target.value)}
                    placeholder="000.000.000-00"
                    className="text-foreground"
                  />
                </div>

                {/* Código do Banco */}
                <div>
                  <Label htmlFor="bankCode" className="text-foreground">Código do Banco</Label>
                  <Input
                    id="bankCode"
                    value={formData.bankCode}
                    onChange={(e) => handleChange('bankCode', e.target.value)}
                    placeholder="000"
                    className="text-foreground"
                  />
                </div>

                {/* Nome do Banco */}
                <div className="md:col-span-2">
                  <Label htmlFor="bankName" className="text-foreground">Nome do Banco</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="Nome do banco"
                    className="text-foreground"
                  />
                </div>

                {/* Agência */}
                <div>
                  <Label htmlFor="agency" className="text-foreground">Agência</Label>
                  <Input
                    id="agency"
                    value={formData.agency}
                    onChange={(e) => handleChange('agency', e.target.value)}
                    placeholder="0000"
                    className="text-foreground"
                  />
                </div>

                {/* Número da Conta */}
                <div>
                  <Label htmlFor="accountNumber" className="text-foreground">Número da Conta</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleChange('accountNumber', e.target.value)}
                    placeholder="00000-0"
                    className="text-foreground"
                  />
                </div>

                {/* Tipo de Conta */}
                <div>
                  <Label htmlFor="accountType" className="text-foreground">Tipo de Conta</Label>
                  <select
                    id="accountType"
                    value={formData.accountType}
                    onChange={(e) => handleChange('accountType', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                  >
                    <option value="corrente">Corrente</option>
                    <option value="poupança">Poupança</option>
                    <option value="pagamento">Pagamento</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-foreground"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : company ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
