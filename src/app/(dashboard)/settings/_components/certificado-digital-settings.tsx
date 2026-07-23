'use client';

import { useCallback, useEffect, useState } from 'react';
import { Lock, Save, Upload, X } from 'lucide-react';
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
import { companyApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';

interface FiscalConfig {
  hasCertificateBlob?: boolean;
  hasCertificatePassword?: boolean;
  certificateFileUrl?: string;
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

export function CertificadoDigitalSettings() {
  const [fiscalConfig, setFiscalConfig] = useState<FiscalConfig | null>(null);
  const [loadingFiscalConfig, setLoadingFiscalConfig] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [savingCertificatePassword, setSavingCertificatePassword] = useState(false);

  const loadFiscalConfig = useCallback(async () => {
    try {
      setLoadingFiscalConfig(true);
      const response = await companyApi.getFiscalConfig();
      const config = (response.data ?? {}) as FiscalConfig;
      setFiscalConfig(config);
    } catch (error) {
      console.error('Erro ao carregar configurações fiscais:', error);
    } finally {
      setLoadingFiscalConfig(false);
    }
  }, []);

  useEffect(() => {
    void loadFiscalConfig();
  }, [loadFiscalConfig]);

  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.pfx') && !file.name.endsWith('.p12')) {
      toast.error('Arquivo deve ser .pfx ou .p12');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }
    setCertificateFile(file);
  };

  const handleUploadCertificate = async () => {
    if (!certificateFile) {
      toast.error('Selecione um arquivo de certificado');
      return;
    }
    if (!certificatePassword) {
      toast.error('Digite a senha do certificado antes de fazer upload');
      return;
    }

    try {
      setUploadingCertificate(true);
      await companyApi.updateFiscalConfig({ certificatePassword });
      await companyApi.uploadCertificate(certificateFile);
      toast.success('Certificado armazenado com sucesso para consulta na SEFAZ!');
      setCertificateFile(null);
      setCertificatePassword('');
      await loadFiscalConfig();
    } catch (error) {
      console.error('Erro ao enviar certificado:', error);
      handleApiError(error);
    } finally {
      setUploadingCertificate(false);
    }
  };

  const handleSaveCertificatePassword = async () => {
    if (!certificatePassword) {
      toast.error('Digite a senha do certificado');
      return;
    }

    try {
      setSavingCertificatePassword(true);
      await companyApi.updateFiscalConfig({ certificatePassword });
      toast.success('Senha do certificado salva com sucesso!');
      await loadFiscalConfig();
    } catch (error) {
      console.error('Erro ao salvar senha do certificado:', error);
      handleApiError(error);
    } finally {
      setSavingCertificatePassword(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Certificado Digital
        </CardTitle>
        <CardDescription>
          Certificado digital para consultar notas fiscais de entrada na SEFAZ. A emissão de
          NF-e/NFC-e é feita pela FocusNFE — o token e o ambiente FocusNFE são configurados por
          empresa (modal &quot;Configuração FocusNFE&quot;).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingFiscalConfig ? (
          <LoaderBlock label="Carregando..." />
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificate-password">Senha do Certificado Digital *</Label>
                <div className="flex gap-2">
                  <Input
                    id="certificate-password"
                    type="password"
                    value={certificatePassword}
                    onChange={(e) => setCertificatePassword(e.target.value)}
                    placeholder="Digite a senha do certificado"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveCertificatePassword}
                    disabled={savingCertificatePassword || !certificatePassword}
                  >
                    {savingCertificatePassword ? (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Senha
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {fiscalConfig?.hasCertificatePassword
                    ? '✅ Senha do certificado já configurada'
                    : 'Configure a senha antes de fazer upload do certificado'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate-upload">
                  Arquivo do Certificado Digital (.pfx ou .p12) *
                </Label>
                <div className="mt-2">
                  <Input
                    id="certificate-upload"
                    type="file"
                    accept=".pfx,.p12"
                    onChange={handleCertificateFileChange}
                    className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/80"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: .pfx, .p12. Tamanho máximo: 10MB
                </p>
                {(fiscalConfig?.hasCertificateBlob || fiscalConfig?.certificateFileUrl) && (
                  <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      ✅ Certificado A1 disponível no sistema
                    </p>
                  </div>
                )}
              </div>

              {certificateFile && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                    <p className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-100">
                      Arquivo selecionado:
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      {certificateFile.name} ({(certificateFile.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUploadCertificate}
                      disabled={uploadingCertificate || !certificatePassword}
                      className="flex-1 sm:flex-none"
                    >
                      {uploadingCertificate ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Enviar Certificado
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setCertificateFile(null)}
                      disabled={uploadingCertificate}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                ℹ️ Sobre o Certificado Digital
              </p>
              <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                <li>• Usado para emissão de NF-e/NFC-e via FocusNFE e para buscar XML de notas de entrada na SEFAZ</li>
                <li>• Configure primeiro a senha do certificado</li>
                <li>• Depois faça upload do arquivo .pfx ou .p12 — ele será enviado à FocusNFE</li>
                <li>• O arquivo é armazenado com segurança no sistema</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default CertificadoDigitalSettings;
