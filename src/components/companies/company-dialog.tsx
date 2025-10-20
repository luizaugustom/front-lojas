'use client';

import { useState, useEffect } from 'react';
import { Company, CreateCompanyDto } from '@/types';
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
import { Building2, Phone, Mail, Hash, MapPin, CreditCard, FileText, Palette } from 'lucide-react';

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSave: (data: CreateCompanyDto) => void;
}

export function CompanyDialog({ open, onOpenChange, company, onSave }: CompanyDialogProps) {
  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: '',
    login: '',
    password: '',
    cnpj: '',
    email: '',
    phone: '',
    stateRegistration: '',
    municipalRegistration: '',
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
        login: company.email, // Usar email como login para edição
        password: '', // Não mostrar senha existente
        cnpj: company.cnpj,
        email: company.email,
        phone: company.phone || '',
        stateRegistration: '',
        municipalRegistration: '',
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
    setLoading(true);

    try {
      // Preparar dados para envio
      const dataToSave: CreateCompanyDto = {
        name: formData.name.trim(),
        login: formData.login.trim(),
        password: formData.password.trim(),
        cnpj: formData.cnpj, // Manter formatação para o backend
        email: formData.email.trim(),
        phone: formData.phone || undefined,
        brandColor: formData.brandColor,
        // Dados opcionais - enviar apenas se preenchidos
        ...(formData.stateRegistration && { stateRegistration: formData.stateRegistration.trim() }),
        ...(formData.municipalRegistration && { municipalRegistration: formData.municipalRegistration.trim() }),
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

      // Se estiver editando, remover password se estiver vazio
      if (company && !formData.password.trim()) {
        delete dataToSave.password;
      }

      await onSave(dataToSave);
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    } else {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
  };

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 5) {
      return cleaned.substring(0, 5) + '-' + cleaned.substring(5, 8);
    }
    return cleaned;
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cnpj') {
      value = formatCNPJ(value);
    } else if (field === 'phone') {
      value = formatPhone(value);
    } else if (field === 'zipCode') {
      value = formatCEP(value);
    } else if (field === 'beneficiaryCpfCnpj') {
      value = formatCPF(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nome da Empresa *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nome da empresa"
                    className="pl-10 text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login" className="text-foreground">Email de Login *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="login"
                    type="email"
                    value={formData.login}
                    onChange={(e) => handleInputChange('login', e.target.value)}
                    placeholder="login@empresa.com"
                    className="pl-10 text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Senha {company ? '(deixe em branco para manter a atual)' : '*'}
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={company ? "Nova senha (opcional)" : "Senha"}
                    className="pl-10 text-foreground"
                    required={!company}
                    minLength={6}
                  />
                </div>
                {!company && (
                  <p className="text-xs text-muted-foreground">
                    A senha deve ter pelo menos 6 caracteres
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-foreground">CNPJ *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="pl-10 text-foreground"
                      maxLength={18}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email de Contato *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contato@empresa.com"
                      className="pl-10 text-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Telefone</simple>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="pl-10 text-foreground"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandColor" className="text-foreground">Cor da Marca</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="brandColor"
                      type="color"
                      value={formData.brandColor}
                      onChange={(e) => handleInputChange('brandColor', e.target.value)}
                      className="w-16 h-10 p-1 text-foreground"
                    />
                    <Input
                      value={formData.brandColor}
                      onChange={(e) => handleInputChange('brandColor', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1 text-foreground"
                    />
                  </div>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
                  <Input
                    id="stateRegistration"
                    value={formData.stateRegistration}
                    onChange={(e) => handleInputChange('stateRegistration', e.target.value)}
                    placeholder="123456789"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipalRegistration">Inscrição Municipal</Label>
                  <Input
                    id="municipalRegistration"
                    value={formData.municipalRegistration}
                    onChange={(e) => handleInputChange('municipalRegistration', e.target.value)}
                    placeholder="12345678"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL do Logo</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    type="url"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="01234-567"
                    maxLength={9}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="São Paulo"
                    maxLength={100}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">Bairro</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    placeholder="Centro"
                    maxLength={100}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="Rua das Flores"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="123"
                    maxLength={20}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                    placeholder="Sala 1"
                    maxLength={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Bancários */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dados Bancários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beneficiaryName">Nome do Favorecido</Label>
                  <Input
                    id="beneficiaryName"
                    value={formData.beneficiaryName}
                    onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                    placeholder="João Silva"
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beneficiaryCpfCnpj">CPF/CNPJ do Favorecido</Label>
                  <Input
                    id="beneficiaryCpfCnpj"
                    value={formData.beneficiaryCpfCnpj}
                    onChange={(e) => handleInputChange('beneficiaryCpfCnpj', e.target.value)}
                    placeholder="123.456.789-00"
                    maxLength={18}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankCode">Código do Banco</Label>
                  <Input
                    id="bankCode"
                    value={formData.bankCode}
                    onChange={(e) => handleInputChange('bankCode', e.target.value)}
                    placeholder="001"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nome do Banco</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="Banco do Brasil"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agency">Agência</Label>
                  <Input
                    id="agency"
                    value={formData.agency}
                    onChange={(e) => handleInputChange('agency', e.target.value)}
                    placeholder="1234-5"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Número da Conta</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder="12345-6"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Tipo de Conta</Label>
                  <select
                    id="accountType"
                    value={formData.accountType}
                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="corrente">Corrente</option>
                    <option value="poupança">Poupança</option>
                    <option value="pagamento">Pagamento</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

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
