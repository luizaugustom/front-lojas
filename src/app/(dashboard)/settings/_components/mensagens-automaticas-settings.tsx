'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Lock, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import { handleApiError } from '@/lib/handleApiError';

interface AutoMessageStatus {
  autoMessageEnabled?: boolean;
  totalUnpaidInstallments?: number;
  totalMessagesSent?: number;
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

export function MensagensAutomaticasSettings() {
  const { api: authApi } = useAuth();
  const { company } = useCompany();
  const [autoMessageStatus, setAutoMessageStatus] = useState<AutoMessageStatus | null>(null);
  const [loadingAutoMessage, setLoadingAutoMessage] = useState(false);
  const [togglingAutoMessage, setTogglingAutoMessage] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  const plan = (company?.plan ?? '').toString().toUpperCase();
  const planAllowed = plan === 'PRO' || plan === 'TRIAL_7_DAYS';

  const loadAutoMessageStatus = useCallback(async () => {
    try {
      setLoadingAutoMessage(true);
      const response = await authApi.get('/company/my-company/auto-message/status');
      setAutoMessageStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar status de mensagens automáticas:', error);
      setAutoMessageStatus(null);
    } finally {
      setLoadingAutoMessage(false);
    }
  }, [authApi]);

  useEffect(() => {
    void loadAutoMessageStatus();
  }, [loadAutoMessageStatus]);

  const handleToggleAutoMessage = async (enable: boolean) => {
    try {
      if (enable && !whatsappConnected) {
        toast.error(
          'Conecte o WhatsApp da empresa nas configurações antes de ativar as mensagens automáticas de cobrança.',
        );
        return;
      }
      if (enable && plan && !planAllowed) {
        toast.error(
          'O envio automático de mensagens de cobrança está disponível apenas para planos Pro ou teste grátis.',
        );
        return;
      }

      setTogglingAutoMessage(true);
      const endpoint = enable
        ? '/company/my-company/auto-message/enable'
        : '/company/my-company/auto-message/disable';

      const response = await authApi.patch(endpoint);
      toast.success(
        response.data.message ||
          `Mensagens automáticas ${enable ? 'ativadas' : 'desativadas'} com sucesso!`,
      );
      await loadAutoMessageStatus();
    } catch (error) {
      console.error('Erro ao alterar status de mensagens automáticas:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (message?.includes('plano')) {
        toast.error('Esta funcionalidade está disponível apenas para planos Pro ou teste grátis.');
      } else {
        handleApiError(error);
      }
    } finally {
      setTogglingAutoMessage(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Mensagens Automáticas de Cobrança
        </CardTitle>
        <CardDescription>
          Configure o envio automático de mensagens para clientes com parcelas a vencer ou
          vencidas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingAutoMessage ? (
          <LoaderBlock label="Carregando..." />
        ) : (
          <>
            {!whatsappConnected && (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
                  O WhatsApp do sistema não está conectado. Entre em contato com o administrador
                  para ativá-lo.
                </AlertDescription>
              </Alert>
            )}

            {plan && !planAllowed && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Funcionalidade disponível apenas para planos Pro ou teste grátis
                    </p>
                    <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                      Seu plano atual: <strong>{plan}</strong>. Entre em contato com o administrador
                      para ajustar seu plano.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      autoMessageStatus?.autoMessageEnabled ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <p className="font-medium">
                    Status: {autoMessageStatus?.autoMessageEnabled ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
                {autoMessageStatus && (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      • Parcelas não pagas: {autoMessageStatus.totalUnpaidInstallments || 0}
                    </p>
                    <p>• Total de mensagens enviadas: {autoMessageStatus.totalMessagesSent || 0}</p>
                  </div>
                )}
              </div>
              <Button
                onClick={() =>
                  handleToggleAutoMessage(!autoMessageStatus?.autoMessageEnabled)
                }
                disabled={
                  togglingAutoMessage ||
                  (!autoMessageStatus?.autoMessageEnabled &&
                    (!whatsappConnected || (!!plan && !planAllowed)))
                }
                variant={autoMessageStatus?.autoMessageEnabled ? 'destructive' : 'default'}
              >
                {togglingAutoMessage ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Processando...
                  </>
                ) : (
                  <>{autoMessageStatus?.autoMessageEnabled ? 'Desativar' : 'Ativar'}</>
                )}
              </Button>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <p className="mb-2 text-sm font-bold text-blue-900 dark:text-blue-100">
                📱 Como funciona o envio automático:
              </p>
              <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                <li>
                  • <strong>No dia do vencimento:</strong> O sistema envia uma mensagem lembrando
                  o cliente sobre o pagamento
                </li>
                <li>
                  • <strong>Parcelas atrasadas:</strong> Mensagens são enviadas a cada 3 dias após
                  o vencimento
                </li>
                <li>
                  • <strong>Horário:</strong> As mensagens são enviadas automaticamente às 9h da
                  manhã
                </li>
                <li>
                  • <strong>Requisito:</strong> O cliente deve ter um telefone válido cadastrado
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                💬 Exemplo de mensagem enviada:
              </p>
              <div className="rounded-lg border bg-white p-3 text-xs dark:bg-gray-950">
                <p className="mb-2 font-medium">🔔 LEMBRETE DE PAGAMENTO</p>
                <p className="mb-1">Olá, [Nome do Cliente]!</p>
                <p className="mb-1">
                  📅 <strong>HOJE É O VENCIMENTO</strong> da sua parcela 1/3 na loja{' '}
                  <strong>[Nome da Empresa]</strong>.
                </p>
                <p className="mb-1">
                  💰 <strong>Valor:</strong> R$ 150,00
                </p>
                <p>
                  Por favor, dirija-se à loja para efetuar o pagamento e manter seu crédito em dia.
                </p>
                <p className="mt-2 opacity-75">Agradecemos a sua preferência! 🙏</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default MensagensAutomaticasSettings;
