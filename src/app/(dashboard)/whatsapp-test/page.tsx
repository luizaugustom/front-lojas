'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Phone,
  FileText,
  Info,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { handleApiError } from '@/lib/handleApiError';
import { toast } from 'react-hot-toast';
import { whatsappApi } from '@/lib/api-endpoints';

export default function WhatsAppTestPage() {
  const [globalStatus, setGlobalStatus] = useState<{
    status: string;
    connectedPhone?: string | null;
  }>({ status: 'unknown' });
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [phone, setPhone] = useState('48998482590');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [validating, setValidating] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    timestamp: Date;
  } | null>(null);

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await whatsappApi.getInstanceStatus();
      setGlobalStatus({
        status: res.data?.status ?? 'not_found',
        connectedPhone: res.data?.connectedPhone,
      });
    } catch {
      setGlobalStatus({ status: 'not_found' });
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const messageTemplates = [
    {
      name: 'Teste Simples',
      message:
        '🤖 Mensagem de teste do sistema Montshop!\n\nSe você recebeu esta mensagem, a integração com WhatsApp está funcionando. ✅',
    },
    {
      name: 'Teste de Cobrança',
      message:
        '💰 *TESTE DE COBRANÇA*\n\nOlá!\n\nMensagem de teste do sistema de cobrança.\n\n📋 *Detalhes:*\n• Parcela: 1 de 1\n• Valor: R$ 0,01\n• Vencimento: Teste\n\n🏢 *Montshop*\n\nObrigado! 🙏',
    },
    {
      name: 'Teste Completo',
      message:
        '📱 *TESTE COMPLETO*\n\n✅ Validação de telefone\n✅ Formatação de número\n✅ Envio via Evolution (instância da empresa)\n\n*Negrito*\n_Itálico_\n~Riscado~',
    },
  ];

  const handleValidatePhone = async () => {
    if (!phone.trim()) {
      toast.error('Digite um número de telefone');
      return;
    }
    setValidating(true);
    try {
      const response = await whatsappApi.validatePhone(phone);
      if (response.data.isValid) {
        toast.success('✅ Número de telefone válido!');
      } else {
        toast.error('❌ Número de telefone inválido');
      }
    } catch {
      toast.error('Erro ao validar telefone');
    } finally {
      setValidating(false);
    }
  };

  const handleFormatPhone = async () => {
    if (!phone.trim()) {
      toast.error('Digite um número de telefone');
      return;
    }
    try {
      const response = await whatsappApi.formatPhone(phone);
      if (response.data.success) {
        setPhone(response.data.formattedPhone);
        toast.success(`✅ Número formatado: ${response.data.formattedPhone}`);
      }
    } catch {
      toast.error('Erro ao formatar telefone');
    }
  };

  const handleSendMessage = async () => {
    if (!phone.trim()) {
      toast.error('Digite um número de telefone');
      return;
    }
    if (!message.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    setSending(true);
    const startTime = Date.now();
    try {
      const response = await whatsappApi.sendMessage({
        to: phone,
        message,
        type: 'text',
      });
      const duration = Date.now() - startTime;
      if (response.data.success) {
        setLastResult({
          success: true,
          message: `Mensagem enviada com sucesso em ${duration}ms`,
          timestamp: new Date(),
        });
        toast.success(`✅ Mensagem enviada para ${phone}!`);
      } else {
        setLastResult({
          success: false,
          message: response.data.message || 'Erro ao enviar mensagem',
          timestamp: new Date(),
        });
        toast.error('❌ Falha ao enviar mensagem');
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const { message: errMsg } = handleApiError(error, { showToast: false });
      setLastResult({
        success: false,
        message: `${errMsg} (${duration}ms)`,
        timestamp: new Date(),
      });
      toast.error(errMsg);
    } finally {
      setSending(false);
    }
  };

  const loadTemplate = (template: (typeof messageTemplates)[0]) => {
    setMessage(template.message);
    toast.success(`📝 Template "${template.name}" carregado`);
  };

  const isConnected = globalStatus.status === 'connected';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-green-500" />
            Teste WhatsApp
          </h1>
          <p className="text-muted-foreground mt-1">
            Painel admin: status da instância global e envio de mensagem de teste
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadStatus} disabled={loadingStatus}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingStatus ? 'animate-spin' : ''}`} />
          Atualizar status
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Instância Global
          </CardTitle>
          <CardDescription>
            Instância única usada para enviar mensagens de todas as empresas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingStatus ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verificando…
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Badge className={isConnected ? 'bg-green-600' : 'bg-red-600'}>
                {isConnected ? 'Conectado' : globalStatus.status === 'not_found' ? 'Não configurada' : globalStatus.status}
              </Badge>
              {globalStatus.connectedPhone && (
                <span className="text-sm text-muted-foreground">
                  Telefone: <strong>{globalStatus.connectedPhone}</strong>
                </span>
              )}
              {!isConnected && (
                <span className="text-sm text-muted-foreground">
                  Conecte a instância em <strong>Configurações → WhatsApp</strong>.
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Info className="h-5 w-5" />
            Informações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900 dark:text-blue-300">
          <p>
            • O envio de teste usa a instância global — ela precisa estar <strong>conectada</strong> em
            Configurações.
          </p>
          <p>
            • Na API: <code className="bg-background/80 px-1 rounded">EVOLUTION_BASE_URL</code>,{' '}
            <code className="bg-background/80 px-1 rounded">EVOLUTION_API_KEY</code> e{' '}
            <code className="bg-background/80 px-1 rounded">API_PUBLIC_URL</code> (webhook de conexão).
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar mensagem de teste
            </CardTitle>
            <CardDescription>Envio via instância global do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de telefone</Label>
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[160px]">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="text"
                    placeholder="48998482590"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={handleValidatePhone} disabled={validating || !phone.trim()}>
                  {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validar'}
                </Button>
                <Button variant="outline" onClick={handleFormatPhone} disabled={!phone.trim()}>
                  Formatar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem de teste..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={sending || !phone.trim() || !message.trim() || !isConnected}
              className="w-full"
              size="lg"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar mensagem
                </>
              )}
            </Button>

            {lastResult && (
              <div
                className={`p-4 rounded-lg border ${
                  lastResult.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                    : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {lastResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{lastResult.success ? 'Sucesso' : 'Erro'}</p>
                    <p className="text-sm text-muted-foreground">{lastResult.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lastResult.timestamp.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Templates
            </CardTitle>
            <CardDescription>Toque para preencher o campo de mensagem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {messageTemplates.map((template, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => loadTemplate(template)}
              >
                <h4 className="font-medium mb-2">{template.name}</h4>
                <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3">
                  {template.message}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadTemplate(template);
                  }}
                >
                  Usar template
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Técnico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Endpoints</h4>
              <p className="text-muted-foreground font-mono text-xs">GET /whatsapp/instance/status</p>
              <p className="text-muted-foreground font-mono text-xs">POST /whatsapp/send-message</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Retry</h4>
              <p className="text-muted-foreground">3 tentativas no backend (1s, 2s, 4s)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
