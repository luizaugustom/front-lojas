'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Company } from '@/types';
import { companyApi } from '@/lib/api-endpoints';
import { toast } from 'react-hot-toast';
import { Loader2, Lock, FileText, Eye, EyeOff, Download, Copy } from 'lucide-react';

interface FocusNfeConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onSuccess?: () => void;
}

export function FocusNfeConfigModal({ open, onOpenChange, company, onSuccess }: FocusNfeConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingFiscalConfig, setLoadingFiscalConfig] = useState(false);
  const [fiscalConfig, setFiscalConfig] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [formData, setFormData] = useState({
    focusNfeApiKey: '',
    focusNfeEnvironment: 'sandbox' as 'sandbox' | 'production',
    ibptToken: '',
  });

  useEffect(() => {
    if (open && company) {
      loadConfig();
      loadFiscalConfig();
    } else {
      // Reset form when modal closes
      setFormData({
        focusNfeApiKey: '',
        focusNfeEnvironment: 'sandbox',
        ibptToken: '',
      });
      setFiscalConfig(null);
    }
  }, [open, company]);

  const loadConfig = async () => {
    if (!company) return;

    setLoadingConfig(true);
    try {
      const response = await companyApi.getFocusNfeConfig(company.id);
      if (response.data) {
        setFormData({
          focusNfeApiKey: response.data.focusNfeApiKey || '',
          focusNfeEnvironment: (response.data.focusNfeEnvironment || 'sandbox') as 'sandbox' | 'production',
          ibptToken: response.data.ibptToken || '',
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar configuração:', error);
      // Não mostrar erro se não houver configuração ainda
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadFiscalConfig = async () => {
    if (!company) return;

    setLoadingFiscalConfig(true);
    try {
      const response = await companyApi.getFiscalConfigForAdmin(company.id);
      setFiscalConfig(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar configurações fiscais:', error);
    } finally {
      setLoadingFiscalConfig(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setLoading(true);
    try {
      await companyApi.updateFocusNfeConfig(company.id, formData);
      toast.success('Configuração do Focus NFe salva com sucesso!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar configuração do Focus NFe');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!fiscalConfig?.certificateFileUrl) {
      toast.error('Certificado não disponível para download');
      return;
    }

    try {
      setDownloadingCertificate(true);
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = fiscalConfig.certificateFileUrl;
      link.download = `certificado-${company?.name || 'empresa'}.pfx`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download do certificado iniciado!');
    } catch (error: any) {
      console.error('Erro ao fazer download do certificado:', error);
      toast.error('Erro ao fazer download do certificado');
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const handleCopyPassword = () => {
    if (!fiscalConfig?.certificatePassword) {
      toast.error('Senha não disponível');
      return;
    }

    navigator.clipboard.writeText(fiscalConfig.certificatePassword);
    toast.success('Senha copiada para a área de transferência!');
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações Fiscais - {company.name}</DialogTitle>
          <DialogDescription>
            Configure a API Key e ambiente do Focus NFe para esta empresa. Visualize as configurações do certificado digital.
          </DialogDescription>
        </DialogHeader>

        {loadingConfig ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="focusNfeApiKey">
                API Key do Focus NFe *
              </Label>
              <Input
                id="focusNfeApiKey"
                type="password"
                value={formData.focusNfeApiKey}
                onChange={(e) => setFormData({ ...formData, focusNfeApiKey: e.target.value })}
                placeholder="Digite a API Key do Focus NFe"
                required
              />
              <p className="text-xs text-muted-foreground">
                API Key específica desta empresa no Focus NFe
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusNfeEnvironment">
                Ambiente *
              </Label>
              <Select
                value={formData.focusNfeEnvironment}
                onValueChange={(value) => setFormData({ ...formData, focusNfeEnvironment: value as 'sandbox' | 'production' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Homologação)</SelectItem>
                  <SelectItem value="production">Production (Produção)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Ambiente onde as notas fiscais serão emitidas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ibptToken">
                Token IBPT (Opcional)
              </Label>
              <Input
                id="ibptToken"
                type="password"
                value={formData.ibptToken}
                onChange={(e) => setFormData({ ...formData, ibptToken: e.target.value })}
                placeholder="Digite o token IBPT (opcional)"
              />
              <p className="text-xs text-muted-foreground">
                Token da API IBPT para consulta de tributos (opcional)
              </p>
            </div>

            {/* Configurações do Certificado Digital */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Certificado Digital
              </h3>
              
              {loadingFiscalConfig ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : fiscalConfig ? (
                <div className="space-y-4">
                  {/* Senha do Certificado */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Senha do Certificado</Label>
                      {fiscalConfig.certificatePassword && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPassword}
                          className="h-7 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={fiscalConfig.certificatePassword || ''}
                        readOnly
                        className="flex-1 font-mono text-sm"
                        placeholder={fiscalConfig.certificatePassword ? '••••••••' : 'Não configurada'}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={!fiscalConfig.certificatePassword}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {fiscalConfig.certificatePassword ? (
                        <span className="text-green-600 dark:text-green-400">✅ Senha configurada</span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">❌ Senha não configurada</span>
                      )}
                    </p>
                  </div>

                  {/* Arquivo do Certificado */}
                  <div className="space-y-2">
                    <Label>Arquivo do Certificado</Label>
                    {fiscalConfig.certificateFileUrl ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <FileText className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                              ✅ Certificado enviado
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 truncate">
                              {fiscalConfig.certificateFileUrl}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleDownloadCertificate}
                          disabled={downloadingCertificate}
                        >
                          {downloadingCertificate ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Baixando...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Baixar Certificado
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-900 dark:text-yellow-100">
                          ❌ Certificado não enviado
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          O certificado deve ser configurado nas configurações da empresa
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Erro ao carregar configurações fiscais
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
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

