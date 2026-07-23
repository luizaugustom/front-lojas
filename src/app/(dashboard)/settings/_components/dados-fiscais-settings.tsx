'use client';

import { useCallback, useEffect, useState } from 'react';
import { Save, Store } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { companyApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';

interface FiscalConfig {
  taxRegime?: string;
  stateRegistration?: string;
  municipioIbge?: string;
  nfceSerie?: string;
  nfeSerie?: string;
  focusNfeEnvironment?: 'sandbox' | 'production';
  csc?: string;
  idTokenCsc?: string;
  cnae?: string;
  aliquotaCbsDefault?: number;
  aliquotaIbsDefault?: number;
  hasCertificateBlob?: boolean;
  hasCertificatePassword?: boolean;
  hasFocusNfeApiKey?: boolean;
  emitOnlyNfe?: boolean;
}

interface FiscalDataForm {
  taxRegime: string;
  cnae: string;
  stateRegistration: string;
  municipioIbge: string;
  nfceSerie: string;
  nfeSerie: string;
  focusNfeEnvironment: 'sandbox' | 'production';
  csc: string;
  idTokenCsc: string;
  aliquotaCbsDefault: string;
  aliquotaIbsDefault: string;
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

export function DadosFiscaisSettings() {
  const [fiscalConfig, setFiscalConfig] = useState<FiscalConfig | null>(null);
  const [loadingFiscalConfig, setLoadingFiscalConfig] = useState(false);
  const [savingFiscalData, setSavingFiscalData] = useState(false);
  const [fiscalDataForm, setFiscalDataForm] = useState<FiscalDataForm>({
    taxRegime: 'SIMPLES_NACIONAL',
    cnae: '',
    stateRegistration: '',
    municipioIbge: '',
    nfceSerie: '1',
    nfeSerie: '1',
    focusNfeEnvironment: 'sandbox',
    csc: '',
    idTokenCsc: '000001',
    aliquotaCbsDefault: '0.9',
    aliquotaIbsDefault: '0.1',
  });

  const loadFiscalConfig = useCallback(async () => {
    try {
      setLoadingFiscalConfig(true);
      const response = await companyApi.getFiscalConfig();
      const config = (response.data ?? {}) as FiscalConfig;
      setFiscalConfig(config);

      setFiscalDataForm({
        taxRegime: config.taxRegime || 'SIMPLES_NACIONAL',
        cnae: config.cnae || '',
        stateRegistration: config.stateRegistration || '',
        municipioIbge: config.municipioIbge || '',
        nfceSerie: config.nfceSerie || '1',
        nfeSerie: config.nfeSerie || '1',
        focusNfeEnvironment: (config.focusNfeEnvironment || 'sandbox') as 'sandbox' | 'production',
        csc: config.csc || '',
        idTokenCsc: config.idTokenCsc || '000001',
        aliquotaCbsDefault: config.aliquotaCbsDefault?.toString() || '0.9',
        aliquotaIbsDefault: config.aliquotaIbsDefault?.toString() || '0.1',
      });
    } catch (error) {
      console.error('Erro ao carregar configurações fiscais:', error);
    } finally {
      setLoadingFiscalConfig(false);
    }
  }, []);

  useEffect(() => {
    void loadFiscalConfig();
  }, [loadFiscalConfig]);

  const handleSaveFiscalData = async () => {
    if (!fiscalDataForm.municipioIbge) {
      toast.error('Código IBGE do município é obrigatório');
      return;
    }
    if (fiscalDataForm.municipioIbge.length !== 7) {
      toast.error('Código IBGE deve ter 7 dígitos');
      return;
    }

    try {
      setSavingFiscalData(true);
      await companyApi.updateFiscalConfig({
        ...fiscalDataForm,
        aliquotaCbsDefault:
          fiscalDataForm.aliquotaCbsDefault === ''
            ? undefined
            : Number(fiscalDataForm.aliquotaCbsDefault),
        aliquotaIbsDefault:
          fiscalDataForm.aliquotaIbsDefault === ''
            ? undefined
            : Number(fiscalDataForm.aliquotaIbsDefault),
      });
      toast.success('Dados fiscais salvos com sucesso!');
      await loadFiscalConfig();
    } catch (error) {
      console.error('Erro ao salvar dados fiscais:', error);
      handleApiError(error);
    } finally {
      setSavingFiscalData(false);
    }
  };

  const handleToggleEmitOnlyNfe = async (checked: boolean) => {
    try {
      await companyApi.updateFiscalConfig({ emitOnlyNfe: checked });
      setFiscalConfig((prev) => (prev ? { ...prev, emitOnlyNfe: checked } : prev));
      toast.success(checked ? 'Emissão somente NFe ativada' : 'Emissão somente NFe desativada');
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Dados Fiscais para Emissão de NFC-e
        </CardTitle>
        <CardDescription>
          Configure os dados obrigatórios para emissão de notas fiscais eletrônicas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingFiscalConfig ? (
          <LoaderBlock label="Carregando..." />
        ) : (
          <>
            {!fiscalConfig?.hasCertificateBlob || !fiscalConfig?.hasCertificatePassword ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                <p className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-100">
                  ⚠️ Certificado A1 e senha necessários para a SEFAZ
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  A emissão de NF-e e NFC-e é feita diretamente com a SEFAZ. Configure a senha e
                  envie o arquivo .pfx ou .p12 na seção &quot;Certificado Digital&quot; abaixo.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <p className="mb-1 text-sm font-semibold text-green-900 dark:text-green-100">
                  ✅ Certificado digital pronto
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Certificado A1 e senha configurados. Complete os dados fiscais abaixo.
                </p>
              </div>
            )}

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRegime">Regime Tributário *</Label>
                <Select
                  value={fiscalDataForm.taxRegime}
                  onValueChange={(value) =>
                    setFiscalDataForm({ ...fiscalDataForm, taxRegime: value })
                  }
                >
                  <SelectTrigger id="taxRegime">
                    <SelectValue placeholder="Selecione o regime tributário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                    <SelectItem value="SIMPLES_NACIONAL_EXCESSO">Simples Nacional - Excesso</SelectItem>
                    <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                    <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
                    <SelectItem value="MEI">MEI</SelectItem>
                  </SelectContent>
                </Select>
                {fiscalConfig?.taxRegime ? (
                  <p className="text-xs text-muted-foreground">✅ Configurado: {fiscalConfig.taxRegime}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateRegistration">Inscrição Estadual *</Label>
                <Input
                  id="stateRegistration"
                  value={fiscalDataForm.stateRegistration}
                  onChange={(e) =>
                    setFiscalDataForm({ ...fiscalDataForm, stateRegistration: e.target.value })
                  }
                  placeholder="Ex: 123.456.789"
                />
                {fiscalConfig?.stateRegistration ? (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✅ Configurada: {fiscalConfig.stateRegistration}
                  </p>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    ❌ Não configurada - obrigatória para emissão de NFC-e
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipioIbge">Código IBGE do Município *</Label>
                <Input
                  id="municipioIbge"
                  value={fiscalDataForm.municipioIbge}
                  onChange={(e) =>
                    setFiscalDataForm({
                      ...fiscalDataForm,
                      municipioIbge: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="Ex: 4205407 (Florianópolis)"
                  maxLength={7}
                />
                <p className="text-xs text-muted-foreground">
                  7 dígitos. Consulte em:{' '}
                  <a
                    href="https://www.ibge.gov.br/explica/codigos-dos-municipios.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    IBGE
                  </a>
                </p>
                {fiscalConfig?.municipioIbge ? (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✅ Configurado: {fiscalConfig.municipioIbge}
                  </p>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    ❌ Não configurado - necessário apenas para emissão de NFC-e
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nfceSerie">Série da NFC-e</Label>
                <Input
                  id="nfceSerie"
                  value={fiscalDataForm.nfceSerie}
                  onChange={(e) =>
                    setFiscalDataForm({
                      ...fiscalDataForm,
                      nfceSerie: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="1"
                  maxLength={3}
                />
                <p className="text-xs text-muted-foreground">
                  Geralmente &quot;1&quot;. Consulte com seu contador se precisar de série diferente.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nfeSerie">Série da NF-e</Label>
                <Input
                  id="nfeSerie"
                  value={fiscalDataForm.nfeSerie}
                  onChange={(e) =>
                    setFiscalDataForm({
                      ...fiscalDataForm,
                      nfeSerie: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="1"
                  maxLength={3}
                />
                <p className="text-xs text-muted-foreground">
                  Série usada nas NF-e modelo 55. Geralmente &quot;1&quot;, salvo orientação fiscal
                  diferente.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="focusNfeEnvironment">Ambiente FocusNFE</Label>
                <Select
                  value={fiscalDataForm.focusNfeEnvironment}
                  onValueChange={(value) =>
                    setFiscalDataForm({
                      ...fiscalDataForm,
                      focusNfeEnvironment: value as 'sandbox' | 'production',
                    })
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
                  Define em qual ambiente da FocusNFE suas NF-e/NFC-e serão emitidas.{' '}
                  {fiscalConfig?.hasFocusNfeApiKey
                    ? 'Token FocusNFE configurado.'
                    : 'Token FocusNFE ainda não configurado (configure em /admin/focus-nfe-config).'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csc">CSC — Código de Segurança do Contribuinte (NFC-e)</Label>
                <Input
                  id="csc"
                  value={fiscalDataForm.csc}
                  onChange={(e) =>
                    setFiscalDataForm({ ...fiscalDataForm, csc: e.target.value.trim() })
                  }
                  placeholder="Token obtido na SEFAZ do seu estado"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Obrigatório para QR Code da NFC-e. Será sincronizado com a FocusNFE ao salvar.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idTokenCsc">ID Token CSC</Label>
                <Input
                  id="idTokenCsc"
                  value={fiscalDataForm.idTokenCsc}
                  onChange={(e) =>
                    setFiscalDataForm({
                      ...fiscalDataForm,
                      idTokenCsc: e.target.value.replace(/\D/g, '').slice(0, 6),
                    })
                  }
                  placeholder="000001"
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnae">CNAE (Classificação Nacional de Atividades Econômicas)</Label>
                <Input
                  id="cnae"
                  value={fiscalDataForm.cnae}
                  onChange={(e) =>
                    setFiscalDataForm({
                      ...fiscalDataForm,
                      cnae: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="Ex: 4761001"
                  maxLength={7}
                />
                <p className="text-xs text-muted-foreground">
                  7 dígitos. Opcional, mas recomendado.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aliquotaCbsDefault">Alíquota padrão CBS</Label>
                  <Input
                    id="aliquotaCbsDefault"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={fiscalDataForm.aliquotaCbsDefault}
                    onChange={(e) =>
                      setFiscalDataForm({ ...fiscalDataForm, aliquotaCbsDefault: e.target.value })
                    }
                    placeholder="0.90"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual piloto usado no cálculo interno de CBS. Revise com o contador antes
                    de usar em produção.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aliquotaIbsDefault">Alíquota padrão IBS</Label>
                  <Input
                    id="aliquotaIbsDefault"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={fiscalDataForm.aliquotaIbsDefault}
                    onChange={(e) =>
                      setFiscalDataForm({ ...fiscalDataForm, aliquotaIbsDefault: e.target.value })
                    }
                    placeholder="0.10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual piloto usado no cálculo interno de IBS. Revise com o contador antes
                    de usar em produção.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveFiscalData}
              disabled={savingFiscalData}
              className="w-full sm:w-auto"
            >
              {savingFiscalData ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Dados Fiscais
                </>
              )}
            </Button>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Emitir somente NFe nas vendas</Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativo, todas as vendas emitirão NFe em vez de NFC-e. Na finalização será
                  perguntado se deseja emitir boleto e a data de vencimento.
                </p>
              </div>
              <Switch
                checked={fiscalConfig?.emitOnlyNfe ?? false}
                onCheckedChange={handleToggleEmitOnlyNfe}
              />
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <p className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                ℹ️ Campos obrigatórios para emissão de NFC-e
              </p>
              <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                <li>• Regime Tributário</li>
                <li>• Inscrição Estadual</li>
                <li>• Código IBGE do Município</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default DadosFiscaisSettings;
