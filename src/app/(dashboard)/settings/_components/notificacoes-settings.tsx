'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { requestNotificationPermission } from '@/lib/electron-adapter';
import { handleApiError } from '@/lib/handleApiError';
import { logger } from '@/lib/logger';

interface NotificationPreferences {
  stockAlerts?: boolean;
  billReminders?: boolean;
  weeklyReports?: boolean;
  salesAlerts?: boolean;
  systemUpdates?: boolean;
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  desktopNotificationsEnabled?: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  stockAlerts: false,
  billReminders: false,
  weeklyReports: false,
  salesAlerts: false,
  systemUpdates: false,
  emailEnabled: false,
  inAppEnabled: false,
  desktopNotificationsEnabled: false,
};

const PREFERENCE_FIELDS: ReadonlyArray<{
  field: keyof NotificationPreferences;
  title: string;
  description: string;
}> = [
  {
    field: 'stockAlerts',
    title: 'Alertas de Estoque',
    description: 'Receba notificacoes quando o estoque estiver baixo',
  },
  {
    field: 'billReminders',
    title: 'Contas a Vencer',
    description: 'Receba lembretes de contas proximas do vencimento',
  },
  {
    field: 'weeklyReports',
    title: 'Relatorios Semanais',
    description: 'Receba resumo semanal das vendas por email',
  },
  {
    field: 'salesAlerts',
    title: 'Alertas de Vendas',
    description: 'Receba notificacoes de novas vendas realizadas',
  },
  {
    field: 'systemUpdates',
    title: 'Atualizacoes do Sistema',
    description: 'Receba notificacoes sobre atualizacoes e novidades',
  },
  {
    field: 'emailEnabled',
    title: 'Notificacoes por Email',
    description: 'Receber notificacoes no email cadastrado',
  },
  {
    field: 'inAppEnabled',
    title: 'Notificacoes In-App',
    description: 'Receber notificacoes dentro do sistema',
  },
  {
    field: 'desktopNotificationsEnabled',
    title: 'Notificacoes na area de trabalho',
    description:
      'Exibir notificacoes do sistema na area de trabalho, mesmo com o navegador em segundo plano',
  },
];

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

export function NotificacoesSettings() {
  const { api: authApi } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await authApi.getNotificationPreferences()) as NotificationPreferences;
      logger.log('Preferencias carregadas:', data);
      setPreferences(data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      console.error('Erro ao carregar preferencias:', error);
      if (status === 401) {
        logger.log('Usuario nao autenticado, ignorando erro de preferencias');
        return;
      }
      if (status === 404) {
        logger.log('Preferencias nao encontradas, criando padroes localmente');
        setPreferences({ ...DEFAULT_PREFERENCES });
        return;
      }
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [authApi]);

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  const handleToggle = async (field: keyof NotificationPreferences, value: boolean) => {
    try {
      setUpdating(true);
      if (field === 'desktopNotificationsEnabled' && value) {
        await requestNotificationPermission();
      }
      const updates: NotificationPreferences = { [field]: value };
      logger.log('Atualizando preferencia:', { field, value, updates });
      await authApi.updateNotificationPreferences(updates);
      setPreferences((current) => (current ? { ...current, [field]: value } : current));
      toast.success('Preferencia atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar preferencia:', error);
      handleApiError(error);
      // Reverte estado local em caso de erro
      await loadPreferences();
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificacoes
          </CardTitle>
          <CardDescription>Configure suas preferencias de notificacao</CardDescription>
        </CardHeader>
        <CardContent>
          <LoaderBlock label="Carregando preferencias..." />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificacoes
          </CardTitle>
          <CardDescription>Configure suas preferencias de notificacao</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Erro ao carregar preferencias</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificacoes
        </CardTitle>
        <CardDescription>Configure suas preferencias de notificacao</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {PREFERENCE_FIELDS.map(({ field, title, description }) => {
          const enabled = Boolean(preferences[field]);
          return (
            <div
              key={field}
              className="flex items-center justify-between gap-4"
              data-preference={field}
            >
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Button
                variant={enabled ? 'default' : 'outline'}
                onClick={() => handleToggle(field, !enabled)}
                disabled={updating}
                aria-pressed={enabled}
              >
                {enabled ? 'Ativado' : 'Desativado'}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default NotificacoesSettings;
