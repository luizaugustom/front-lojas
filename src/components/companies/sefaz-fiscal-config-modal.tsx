'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Company } from '@/types';
import { companyApi } from '@/lib/api-endpoints';
import { toast } from 'react-hot-toast';
import { Loader2, Key } from 'lucide-react';

interface SefazFiscalConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onSuccess?: () => void;
}

export function SefazFiscalConfigModal({
  open,
  onOpenChange,
  company,
  onSuccess,
}: SefazFiscalConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingFiscalConfig, setLoadingFiscalConfig] = useState(false);
  const [formData, setFormData] = useState({
    nfeioApiKey: '',
    nfeioEnvironment: 'sandbox' as 'sandbox' | 'production',
    ibptToken: '',
  });

  const loadNfeioConfig = useCallback(async () => {
    if (!company) return;

    setLoadingFiscalConfig(true);
    try {
      const response = await companyApi.getNfeioConfigForAdmin(company.id);
      const data = response.data;
      setFormData({
        nfeioApiKey: data?.nfeioApiKey || '',
        nfeioEnvironment: data?.nfeioEnvironment === 'production' ? 'production' : 'sandbox',
        ibptToken: data?.ibptToken || '',
      });
    } catch (error: any) {
      console.error('Erro ao carregar configuração NFe.io:', error);
      toast.error('Erro ao carregar configuração NFe.io');
    } finally {
      setLoadingFiscalConfig(false);
    }
  }, [company]);

  useEffect(() => {
    if (open && company) {
      loadNfeioConfig();
    } else {
      setFormData({ nfeioApiKey: '', nfeioEnvironment: 'sandbox', ibptToken: '' });
    }
  }, [open, company, loadNfeioConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    if (!formData.nfeioApiKey.trim()) {
      toast.error('Token NFe.io é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await companyApi.updateNfeioConfigForAdmin(company.id, {
        nfeioApiKey: formData.nfeioApiKey.trim(),
        nfeioEnvironment: formData.nfeioEnvironment,
        ibptToken: formData.ibptToken.trim() || undefined,
      });
      toast.success('Configuração NFe.io salva com sucesso!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar configuração NFe.io');
    } finally {
      setLoading(false);
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuração NFe.io — {company.name}</DialogTitle>
          <DialogDescription>
            Token da API NFe.io e ambiente para emissão de NF-e e NFC-e desta empresa.
          </DialogDescription>
        </DialogHeader>

        {loadingFiscalConfig ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nfeioApiKey">Token NFe.io *</Label>
              <Input
                id="nfeioApiKey"
                type="password"
                value={formData.nfeioApiKey}
                onChange={(e) => setFormData({ ...formData, nfeioApiKey: e.target.value })}
                placeholder="Token da API NFe.io"
              />
              <p className="text-xs text-muted-foreground">
                Obrigatório. Token da conta NFe.io para esta empresa.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nfeioEnvironment">Ambiente NFe.io *</Label>
              <Select
                value={formData.nfeioEnvironment}
                onValueChange={(value) =>
                  setFormData({ ...formData, nfeioEnvironment: value as 'sandbox' | 'production' })
                }
              >
                <SelectTrigger id="nfeioEnvironment">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Homologação (testes)</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define se as notas serão emitidas no ambiente de testes ou produção da NFe.io.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ibptToken">Token IBPT (opcional)</Label>
              <Input
                id="ibptToken"
                type="password"
                value={formData.ibptToken}
                onChange={(e) => setFormData({ ...formData, ibptToken: e.target.value })}
                placeholder="Token para tributos aproximados (Lei 12.741)"
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Token IBPT para cálculo de tributos aproximados (Lei 12.741).
              </p>
            </div>

            <div className="rounded-lg border p-3 text-sm bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 flex items-start gap-2">
              <Key className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                A NFe.io gerencia os certificados digitais de emissão automaticamente. O certificado A1 enviado pela
                empresa nas configurações fiscais serve apenas para consultar notas de entrada na SEFAZ.
              </span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}