'use client';

import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Percent, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { companyApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';

interface InstallmentConfig {
  installmentInterestRates: Record<string, number | undefined>;
  maxInstallments: number | undefined;
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

export function ParcelamentoSettings() {
  const { api: authApi } = useAuth();
  const [installmentConfig, setInstallmentConfig] = useState<InstallmentConfig>({
    installmentInterestRates: {},
    maxInstallments: 12,
  });
  const [savingInstallmentConfig, setSavingInstallmentConfig] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const loadInstallmentConfig = useCallback(async () => {
    try {
      setLoadingConfig(true);
      const response = await authApi.get('/company/my-company');
      const data = response.data;
      const rates = data?.installmentInterestRates || {};
      const defaultRates: Record<string, number | undefined> = {};
      for (let i = 1; i <= 24; i++) {
        defaultRates[i.toString()] = rates[i.toString()] ?? 0;
      }
      setInstallmentConfig({
        installmentInterestRates: defaultRates,
        maxInstallments: data?.maxInstallments ?? 12,
      });
    } catch (error) {
      console.error('Erro ao carregar configurações de parcelamento:', error);
    } finally {
      setLoadingConfig(false);
    }
  }, [authApi]);

  useEffect(() => {
    void loadInstallmentConfig();
  }, [loadInstallmentConfig]);

  const updateInstallmentRate = (parcela: number, taxa: number | undefined) => {
    setInstallmentConfig({
      ...installmentConfig,
      installmentInterestRates: {
        ...installmentConfig.installmentInterestRates,
        [parcela.toString()]: taxa,
      },
    });
  };

  const handleSaveInstallmentConfig = async () => {
    for (const [parcela, taxa] of Object.entries(installmentConfig.installmentInterestRates)) {
      if (taxa != null && (taxa < 0 || taxa > 100)) {
        toast.error(`Taxa de juros da parcela ${parcela} deve estar entre 0% e 100%`);
        return;
      }
    }

    const maxInstallmentsToSave = installmentConfig.maxInstallments ?? 12;
    if (maxInstallmentsToSave < 0 || maxInstallmentsToSave > 24) {
      toast.error('Limite de parcelas deve estar entre 0 e 24');
      return;
    }

    try {
      setSavingInstallmentConfig(true);
      const ratesToSave = Object.fromEntries(
        Object.entries(installmentConfig.installmentInterestRates).map(([k, v]) => [k, v ?? 0]),
      );
      await companyApi.updateMyCompany({
        installmentInterestRates: ratesToSave,
        maxInstallments: maxInstallmentsToSave,
      });
      toast.success('Configurações de parcelamento salvas com sucesso!');
      await loadInstallmentConfig();
    } catch (error) {
      console.error('Erro ao salvar configurações de parcelamento:', error);
      handleApiError(error);
    } finally {
      setSavingInstallmentConfig(false);
    }
  };

  if (loadingConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Configurações de Parcelamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoaderBlock label="Carregando..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Configurações de Parcelamento
        </CardTitle>
        <CardDescription>
          Configure a taxa de juros e o limite máximo de parcelas para vendas a prazo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxInstallments">Limite Máximo de Parcelas</Label>
            <Input
              id="maxInstallments"
              type="number"
              min="0"
              max="24"
              value={installmentConfig.maxInstallments ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                const n = v === '' ? undefined : parseInt(v, 10);
                setInstallmentConfig({
                  ...installmentConfig,
                  maxInstallments: v === '' ? undefined : (isNaN(n as number) ? undefined : n),
                });
              }}
              placeholder="12"
            />
            <p className="text-xs text-muted-foreground">
              Número máximo de parcelas permitidas para vendas a prazo. Use 0 para desabilitar
              vendas a prazo. Padrão: 12 parcelas.
            </p>
          </div>

          {(installmentConfig.maxInstallments ?? 12) > 0 && (
            <div className="space-y-2">
              <Label>Taxas de Juros por Parcela (%)</Label>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Parcela</TableHead>
                      <TableHead>Taxa de Juros (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(
                      { length: installmentConfig.maxInstallments ?? 12 },
                      (_, i) => i + 1,
                    ).map((parcela) => (
                      <TableRow key={parcela}>
                        <TableCell className="font-medium">{parcela}x</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={installmentConfig.installmentInterestRates[parcela.toString()] ?? ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                const n = parseFloat(v);
                                updateInstallmentRate(
                                  parcela,
                                  v === '' ? undefined : isNaN(n) ? undefined : n,
                                );
                              }}
                              placeholder="0.00"
                              className="w-32"
                            />
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground">
                Configure a taxa de juros para cada parcela individualmente. Ex: Parcela 1 com 0%,
                Parcela 2 com 2.5%, etc.
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={handleSaveInstallmentConfig}
          disabled={savingInstallmentConfig}
          className="w-full sm:w-auto"
        >
          {savingInstallmentConfig ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
            ℹ️ Sobre os Juros em Parcelas
          </p>
          <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
            <li>• Configure taxas de juros diferentes para cada parcela</li>
            <li>• Parcelas podem ter 0% de juros (sem juros)</li>
            <li>• O valor total da venda será calculado automaticamente com base nas taxas de cada parcela</li>
            <li>• Os juros aumentam o lucro líquido da empresa</li>
            <li>• O limite de parcelas será validado ao criar vendas a prazo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ParcelamentoSettings;
