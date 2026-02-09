'use client';

import { useState } from 'react';
import {
  HelpCircle, FileText, Download, RefreshCw, XCircle,
  PlusCircle, Link2, FileEdit, CheckCircle, AlertTriangle,
  Monitor, Globe, Zap, Clock, Package, CheckCircle2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface InvoiceHelpModalProps {
  open: boolean;
  onClose: () => void;
}

// Helper Components
function FeatureCard({ icon, title, description, badge }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Card className="transition-all hover:shadow-md hover:border-primary duration-200 cursor-default">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="mt-1">{icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{title}</h4>
              {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StepItem({ number, text, emphasis }: {
  number: number;
  text: string;
  emphasis?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm">{text}</p>
        {emphasis && (
          <p className="text-xs text-muted-foreground mt-1">→ {emphasis}</p>
        )}
      </div>
    </div>
  );
}

function StatusBadgeDemo({ status, color, description }: {
  status: string;
  color: 'green' | 'red' | 'yellow';
  description?: string;
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
        {status}
      </span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}

function TipItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <span className="text-sm">{text}</span>
    </li>
  );
}

function TroubleshootItem({ problem, solution }: { problem: string; solution: string }) {
  return (
    <div className="space-y-1">
      <h5 className="text-sm font-medium text-destructive">❌ {problem}</h5>
      <p className="text-sm text-muted-foreground ml-6">✓ {solution}</p>
    </div>
  );
}

export function InvoiceHelpModal({ open, onClose }: InvoiceHelpModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Central de Ajuda - Notas Fiscais</DialogTitle>
              <DialogDescription>
                Aprenda a usar todas as funcionalidades da página de NF-e
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="emit">Emitir NF-e</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar</TabsTrigger>
            <TabsTrigger value="tips">Dicas</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Welcome Card */}
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Bem-vindo à Central de NF-e</CardTitle>
                    <CardDescription>
                      Sistema completo para emissão e gerenciamento de Notas Fiscais Eletrônicas
                    </CardDescription>
                  </div>
                  <FileText className="h-12 w-12 text-blue-500 animate-pulse" />
                </div>
              </CardHeader>
            </Card>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<PlusCircle className="h-5 w-5 text-green-500" />}
                title="Emitir NF-e"
                description="Dois modos: vincular à venda existente ou preencher manualmente"
                badge="2 Modos"
              />
              <FeatureCard
                icon={<Download className="h-5 w-5 text-blue-500" />}
                title="Download"
                description="Baixe PDF para impressão ou XML para importação"
                badge="PDF/XML"
              />
              <FeatureCard
                icon={<RefreshCw className="h-5 w-5 text-purple-500" />}
                title="Consultar Status"
                description="Verifique o status da nota direto na SEFAZ"
                badge="Tempo Real"
              />
              <FeatureCard
                icon={<XCircle className="h-5 w-5 text-red-500" />}
                title="Cancelamento"
                description="Cancele notas autorizadas com justificativa"
                badge="Seguro"
              />
            </div>

            {/* Environment Badge */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Modo Web</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Desktop (Electron)</span>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    Funcionamento Idêntico
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Emit NF-e */}
          <TabsContent value="emit" className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Prerequisites Alert */}
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Antes de Emitir
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Certifique-se de que a empresa possui configuração fiscal completa (CNPJ, IE, API Key Focus NFe, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Mode 1: Link to Sale */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-blue-500" />
                  <CardTitle>Modo 1: Vincular à Venda Existente</CardTitle>
                  <Badge variant="secondary">Mais Rápido</Badge>
                </div>
                <CardDescription>
                  Use este modo quando já tiver uma venda cadastrada no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <StepItem number={1} text="Clique em 'Emitir NF-e'" />
                <StepItem number={2} text="Selecione a aba 'Vincular à Venda'" />
                <StepItem number={3} text="Informe o ID da venda (ex: 123)" />
                <StepItem number={4} text="Clique em 'Emitir NF-e'" />

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <CheckCircle className="inline h-4 w-4 mr-1 text-green-500" />
                    Os dados do cliente e produtos serão preenchidos automaticamente
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mode 2: Manual */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5 text-purple-500" />
                  <CardTitle>Modo 2: Emissão Manual</CardTitle>
                  <Badge variant="secondary">Completo</Badge>
                </div>
                <CardDescription>
                  Preencha todos os dados manualmente quando não houver venda vinculada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <StepItem number={1} text="Clique em 'Emitir NF-e'" />
                <StepItem number={2} text="Selecione a aba 'Emissão Manual'" />
                <StepItem number={3} text="Preencha os dados do destinatário" emphasis="obrigatórios: CPF/CNPJ, nome, endereço completo" />
                <StepItem number={4} text="Adicione os itens da nota" emphasis="pode buscar produtos cadastrados ou adicionar manualmente" />
                <StepItem number={5} text="Informe a forma de pagamento" emphasis="cartão requer dados adicionais (NT 2025.001)" />
                <StepItem number={6} text="Adicione observações (opcional)" />
                <StepItem number={7} text="Clique em 'Emitir NF-e'" />
              </CardContent>
            </Card>

            {/* Card Payment Warning */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  Pagamento com Cartão (NT 2025.001)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Quando selecionar <strong>Cartão de Crédito</strong> ou <strong>Cartão de Débito</strong>, será necessário preencher:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>CNPJ da Credenciadora (obrigatório)</li>
                  <li>Tipo de Operação (obrigatório)</li>
                  <li>Bandeira do Cartão (opcional, padrão: Outras)</li>
                </ul>
                <p className="text-muted-foreground pt-2">
                  Sistema sempre usa "Pagamento Não Integrado" pois não há máquinas integradas.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Manage */}
          <TabsContent value="manage" className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Download Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-500" />
                  <CardTitle>Download de Arquivos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500" />
                      Baixar PDF
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Arquivo para impressão e visualização. Use para enviar ao cliente ou arquivo físico.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      Baixar XML
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Arquivo para importação em sistemas contábeis. Obrigatório para contabilidade.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      <Download className="mr-2 h-4 w-4" /> XML
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Check Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-purple-500" />
                  <CardTitle>Consultar Status na SEFAZ</CardTitle>
                  <Badge>Tempo Real</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Clique no botão <strong>"Status"</strong> para consultar o status atual da nota junto à SEFAZ.
                </p>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status Possíveis:</h4>
                  <div className="space-y-2">
                    <StatusBadgeDemo
                      status="Autorizada"
                      color="green"
                      description="Nota aceita pela SEFAZ e válida"
                    />
                    <StatusBadgeDemo
                      status="Cancelada"
                      color="red"
                      description="Nota foi cancelada (não pode ser revertido)"
                    />
                    <StatusBadgeDemo
                      status="MOCK"
                      color="yellow"
                      description="Nota em ambiente de teste"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancel Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <CardTitle>Cancelar Nota Fiscal</CardTitle>
                  <Badge variant="destructive">Irreversível</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    Atenção: O cancelamento de nota fiscal é IRREVERSÍVEL!
                  </p>
                </div>

                <StepItem number={1} text="Somente notas 'Autorizadas' podem ser canceladas" />
                <StepItem number={2} text="Clique no botão 'Cancelar' vermelho na linha da nota" />
                <StepItem number={3} text="Digite o motivo do cancelamento (mínimo 15 caracteres)" />
                <StepItem number={4} text="Confirme o cancelamento" />

                <div className="p-3 bg-muted rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground">
                    <AlertTriangle className="inline h-4 w-4 mr-1 text-yellow-500" />
                    Prazo legal: 24 horas para cancelamento após autorização
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Tips */}
          <TabsContent value="tips" className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Web vs Desktop */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Web vs Desktop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <h4 className="font-medium">Versão Web</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• Acesso de qualquer navegador</li>
                      <li>• Requer conexão constante</li>
                      <li>• Ideal para uso esporádico</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-purple-500" />
                      <h4 className="font-medium">Desktop (Electron)</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• Aplicativo instalado</li>
                      <li>• Suporte offline (sincronização)</li>
                      <li>• Ideal para uso frequente</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    <Zap className="inline h-4 w-4 mr-1 text-yellow-500" />
                    Emissão de NF-e funciona de forma idêntica em ambas as versões
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Boas Práticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <TipItem
                    icon={<Clock className="h-4 w-4 text-blue-500" />}
                    text="Emita as notas logo após a venda para evitar esquecimentos"
                  />
                  <TipItem
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                    text="Sempre salve o XML e PDF em local seguro para arquivo"
                  />
                  <TipItem
                    icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    text="Confira todos os dados antes de emitir, correções exigem cancelamento"
                  />
                  <TipItem
                    icon={<RefreshCw className="h-4 w-4 text-purple-500" />}
                    text="Consulte o status regularmente para garantir que está tudo ok"
                  />
                </ul>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Problemas Comuns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TroubleshootItem
                    problem="Erro: 'Dados fiscais incompletos'"
                    solution="Acesse Configurações e preencha todos os dados fiscais da empresa (CNPJ, IE, Código IBGE, CEP, API Key Focus NFe)"
                  />
                  <TroubleshootItem
                    problem="Erro: 'CPF/CNPJ inválido'"
                    solution="Verifique se o documento possui 11 dígitos (CPF) ou 14 (CNPJ) e se os dígitos verificadores estão corretos"
                  />
                  <TroubleshootItem
                    problem="Erro ao adicionar cartão"
                    solution="Para pagamentos com cartão, preencha todos os campos obrigatórios: CNPJ da Credenciadora e Tipo de Operação"
                  />
                  <TroubleshootItem
                    problem="Botão 'Status' desabilitado"
                    solution="Somente notas com Chave de Acesso podem ter o status consultado. Notas sem chave ainda não foram processadas."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
