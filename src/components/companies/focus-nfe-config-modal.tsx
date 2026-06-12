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

interface FocusNfeConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onSuccess?: () => void;
}

/**
 * Modal de configuração da API FocusNFE por empresa.
 * Substitui o antigo `SefazFiscalConfigModal` (NFe.io). O token FocusNFE
 * é global no Admin, então este modal delega para a rota /admin/focus-nfe-config.
 */
export function FocusNfeConfigModal({
  open,
  onOpenChange,
  company,
  onSuccess,
}: FocusNfeConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [formData, setFormData] = useState({
    focusNfeApiKey: '',
    focusNfeEnvironment: 'sandbox' as 'sandbox' | 'production',
    ibptToken: '',
  });

  const loadConfig = useCallback(async () => {
    if (!company) return;

    setLoadingConfig(true);
    try {
      const response = await companyApi.getFocusNfeConfigForAdmin(company.id);
      const data = response.data;
      setFormData({
        focusNfeApiKey: data?.focusNfeApiKey || '',
        focusNfeEnvironment: data?.focusNfeEnvironment === 'production' ? 'production' : 'sandbox',
        ibptToken: data?.ibptToken || '',
      });
    } catch (error: any) {
      console.error('Erro ao carregar configuração FocusNFE:', error);
      toast.error('Erro ao carregar configuração FocusNFE');
    } finally {
      setLoadingConfig(false);
    }
  }, [company]);

  useEffect(() => {
    if (open && company) {
      loadConfig();
    } else {
      setFormData({ focusNfeApiKey: '', focusNfeEnvironment: 'sandbox', ibptToken: '' });
    }
  }, [open, company, loadConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    if (!formData.focusNfeApiKey.trim() || formData.focusNfeApiKey === '••••••••') {
      toast.error('Token FocusNFE é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await companyApi.updateFocusNfeConfigForAdmin(company.id, {
        focusNfeApiKey: formData.focusNfeApiKey.trim(),
        focusNfeEnvironment: formData.focusNfeEnvironment,
        ibptToken: formData.ibptToken.trim() || undefined,
      });
      toast.success('Configuração FocusNFE salva com sucesso!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar configuração FocusNFE');
    } finally {
      setLoading(false);
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuração FocusNFE — {company.name}</DialogTitle>
          <DialogDescription>
            Token da API FocusNFE e ambiente para emissão de NF-e e NFC-e desta empresa.
          </DialogDescription>
        </DialogHeader>

        {loadingConfig ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="focusNfeApiKey">Token FocusNFE *</Label>
              <Input
                id="focusNfeApiKey"
                type="password"
                value={formData.focusNfeApiKey}
                onChange={(e) => setFormData({ ...formData, focusNfeApiKey: e.target.value })}
                placeholder="Token da API FocusNFE (v2)"
              />
              <p className="text-xs text-muted-foreground">
                Obrigatório. Token da conta FocusNFE para esta empresa.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusNfeEnvironment">Ambiente FocusNFE *</Label>
              <Select
                value={formData.focusNfeEnvironment}
                onValueChange={(value) =>
                  setFormData({ ...formData, focusNfeEnvironment: value as 'sandbox' | 'production' })
                }
              >
                <SelectTrigger id="focusNfeEnvironment">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Homologação (testes)</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define se as notas serão emitidas no ambiente de testes ou produção da FocusNFE.
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
                A FocusNFE exige que o certificado digital A1 seja enviado separadamente
                pelo botão <strong>Enviar Certificado</strong> na seção de Configurações
                Fiscais da empresa. Apenas o token autoriza a comunicação com a API.
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
