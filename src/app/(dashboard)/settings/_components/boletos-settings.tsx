'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Banknote } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { companyApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';

interface CompanyData {
  boletoAllowed?: boolean;
  boletoEnabled?: boolean;
  unimakeConfigured?: boolean;
  unimakeSandbox?: boolean;
}

const LoaderBlock = ({ label }: { label: string }) => (
  <div
    role="status"
    aria-live="polite"
    aria-label={label}
    className="flex flex-col items-center justify-center gap-2 py-8"
  >
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export function BoletosSettings() {
  const { api: authApi } = useAuth();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [boletoEnabledForm, setBoletoEnabledForm] = useState(false);
  const [savingBoletoFlag, setSavingBoletoFlag] = useState(false);

  const loadCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authApi.get('/company/my-company');
      setCompanyData(response.data);
      setBoletoEnabledForm(!!response.data?.boletoEnabled);
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
      setCompanyData(null);
    } finally {
      setLoading(false);
    }
  }, [authApi]);

  useEffect(() => {
    void loadCompanyData();
  }, [loadCompanyData]);

  const handleSaveBoletoFlag = async () => {
    try {
      setSavingBoletoFlag(true);
      await companyApi.updateMyCompany({ boletoEnabled: boletoEnabledForm });
      toast.success(boletoEnabledForm ? 'Boletos ativados.' : 'Boletos desativados.');
      await loadCompanyData();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingBoletoFlag(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Boletos
        </CardTitle>
        <CardDescription>
          Ative o módulo de boletos. Os boletos são emitidos via Unimake e-Boleto, com credenciais
          gerenciadas exclusivamente pelo administrador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <LoaderBlock label="Carregando..." />
        ) : (
          <>
            {companyData?.boletoAllowed === false && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Para ativar boletos, é necessária a liberação do administrador. Entre em contato
                  com o suporte.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Ativar boletos</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilita a página de gestão de boletos e a opção de emitir boleto junto à nota
                    fiscal.
                  </p>
                </div>
                <Switch
                  checked={boletoEnabledForm}
                  onCheckedChange={setBoletoEnabledForm}
                  disabled={companyData?.boletoAllowed === false}
                />
              </div>

              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Boleto Unimake configurado</Label>
                    <p className="text-xs text-muted-foreground">
                      Tokens (appId/appKey) são gerenciados exclusivamente pelo administrador.
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      companyData?.unimakeConfigured
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {companyData?.unimakeConfigured ? 'Sim' : 'Não'}
                  </span>
                </div>
                {companyData?.unimakeSandbox !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    Ambiente atual: {companyData.unimakeSandbox ? 'Sandbox (testes)' : 'Produção'}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleSaveBoletoFlag} disabled={savingBoletoFlag}>
              {savingBoletoFlag ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default BoletosSettings;
