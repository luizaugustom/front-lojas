'use client';

import { useState } from 'react';
import { MessageSquare, Send, Loader2, CheckCircle, XCircle, Phone, FileText, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function WhatsAppTestPage() {
  const { api } = useAuth();
  const [phone, setPhone] = useState('48998482590');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [validating, setValidating] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    timestamp: Date;
  } | null>(null);

  // Templates de mensagens de teste
  const messageTemplates = [
    {
      name: 'Teste Simples',
      message: '🤖 Mensagem de teste do sistema Montshop!\n\nSe você recebeu esta mensagem, significa que a integração com WhatsApp está funcionando corretamente. ✅'
    },
    {
      name: 'Teste de Cobrança',
      message: '💰 *TESTE DE COBRANÇA*\n\nOlá!\n\nEsta é uma mensagem de teste do sistema de cobrança.\n\n📋 *Detalhes:*\n• Parcela: 1 de 1\n• Valor: R$ 0,01\n• Vencimento: Teste\n\n🏢 *Montshop*\n\nObrigado! 🙏'
    },
    {
      name: 'Teste Completo',
      message: '📱 *TESTE COMPLETO DO SISTEMA*\n\n✅ Validação de telefone\n✅ Formatação de número\n✅ Envio via Z-API\n✅ Mensagem com emojis\n✅ Texto formatado\n\n*Negrito*\n_Itálico_\n~Riscado~\n\nSistema funcionando corretamente! 🎉'
    }
  ];

  const handleValidatePhone = async () => {
    if (!phone.trim()) {
      toast.error('Digite um número de telefone');
      return;
    }

    setValidating(true);
    try {
      const response = await api.post('/whatsapp/validate-phone', { phone });
      
      if (response.data.isValid) {
        toast.success('✅ Número de telefone válido!');
      } else {
        toast.error('❌ Número de telefone inválido');
      }
    } catch (error) {
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
      const response = await api.post('/whatsapp/format-phone', { phone });
      
      if (response.data.success) {
        setPhone(response.data.formattedPhone);
        toast.success(`✅ Número formatado: ${response.data.formattedPhone}`);
      }
    } catch (error) {
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
      const response = await api.post('/whatsapp/send-message', {
        to: phone,
        message: message,
        type: 'text'
      });

      const duration = Date.now() - startTime;

      if (response.data.success) {
        setLastResult({
          success: true,
          message: `Mensagem enviada com sucesso em ${duration}ms`,
          timestamp: new Date()
        });
        toast.success(`✅ Mensagem enviada para ${phone}!`);
      } else {
        setLastResult({
          success: false,
          message: response.data.message || 'Erro ao enviar mensagem',
          timestamp: new Date()
        });
        toast.error('❌ Falha ao enviar mensagem');
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      setLastResult({
        success: false,
        message: error.response?.data?.message || error.message || 'Erro desconhecido',
        timestamp: new Date()
      });
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const loadTemplate = (template: typeof messageTemplates[0]) => {
    setMessage(template.message);
    toast.success(`📝 Template "${template.name}" carregado`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-green-500" />
            Teste WhatsApp
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie mensagens de teste via Z-API
          </p>
        </div>
      </div>

      {/* Informações da Z-API */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Info className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900 dark:text-blue-300">
          <p>• O número padrão <strong>48998482590</strong> já está pré-configurado para testes</p>
          <p>• As mensagens são enviadas via Z-API (certifique-se de que está configurada no .env)</p>
          <p>• Formatos aceitos: 11987654321, (11) 98765-4321, +55 11 98765-4321</p>
          <p>• O sistema faz 3 tentativas automáticas em caso de falha</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário de Envio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Mensagem de Teste
            </CardTitle>
            <CardDescription>
              Configure o número e a mensagem para envio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Número de Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
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
                <Button
                  variant="outline"
                  onClick={handleValidatePhone}
                  disabled={validating || !phone.trim()}
                >
                  {validating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Validar'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFormatPhone}
                  disabled={!phone.trim()}
                >
                  Formatar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Digite o número com ou sem formatação
              </p>
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem de teste aqui..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{message.length} caracteres</span>
                <span className={message.length > 65536 ? 'text-red-500' : ''}>
                  Máximo: 65536
                </span>
              </div>
            </div>

            {/* Botão de Envio */}
            <Button
              onClick={handleSendMessage}
              disabled={sending || !phone.trim() || !message.trim()}
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
                  Enviar Mensagem
                </>
              )}
            </Button>

            {/* Resultado do Último Envio */}
            {lastResult && (
              <div className={`p-4 rounded-lg border ${
                lastResult.success 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
                  : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
              }`}>
                <div className="flex items-start gap-2">
                  {lastResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      lastResult.success 
                        ? 'text-green-900 dark:text-green-300' 
                        : 'text-red-900 dark:text-red-300'
                    }`}>
                      {lastResult.success ? 'Sucesso' : 'Erro'}
                    </p>
                    <p className={`text-sm ${
                      lastResult.success 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-red-700 dark:text-red-400'
                    }`}>
                      {lastResult.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lastResult.timestamp.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Templates de Mensagens
            </CardTitle>
            <CardDescription>
              Selecione um template para começar rapidamente
            </CardDescription>
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
                  Usar este template
                </Button>
              </div>
            ))}

            {/* Dica */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-2">💡 Dica</h4>
              <p className="text-xs text-muted-foreground">
                Use os templates acima ou crie sua própria mensagem personalizada. 
                O WhatsApp suporta formatação: *negrito*, _itálico_, ~riscado~.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Provider</h4>
              <p className="text-muted-foreground">Z-API</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Endpoint</h4>
              <p className="text-muted-foreground font-mono text-xs">POST /whatsapp/send-message</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Retry</h4>
              <p className="text-muted-foreground">3 tentativas (1s, 2s, 4s)</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Documentação:</strong> Para mais informações sobre o sistema de envio de mensagens de cobrança, 
              consulte o arquivo <code className="bg-background px-1 py-0.5 rounded">docs/WHATSAPP-COBRANCA.md</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
