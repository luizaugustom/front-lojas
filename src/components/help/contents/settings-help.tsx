'use client';

import {
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  CreditCard,
  FileBadge,
  FileText,
  Landmark,
  Lock,
  MessageSquare,
  Percent,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureCard, StepItem, TipItem, TroubleshootItem, type PageHelpTab } from '../page-help-modal';

const STAGGER = 50;

export const settingsHelpTitle = 'Central de Ajuda - Configurações';
export const settingsHelpDescription =
  'Hub com 11 categorias para gerenciar perfil, empresa, fiscal, catálogo, mensagens, WhatsApp, boletos, taxas e administração.';
export const settingsHelpIcon = <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />;

interface CategoryHelp {
  title: string;
  description: string;
  badge?: string;
}

const CATEGORY_HELP: readonly CategoryHelp[] = [
  {
    title: 'Empresa',
    description:
      'Perfil do usuário logado, segurança (troca de senha) e identidade visual da empresa (logo, apelido e cor da marca).',
  },
  {
    title: 'Dados Fiscais',
    description:
      'Regime tributário, IE, IM, CNAE, ambiente SEFAZ e séries usadas na emissão de NF-e/NFC-e.',
    badge: 'Fiscal',
  },
  {
    title: 'Certificado Digital',
    description:
      'Upload e manutenção do certificado A1 (.pfx) usado na comunicação com a SEFAZ.',
    badge: 'Fiscal',
  },
  {
    title: 'Catálogo',
    description: 'Endereço público e ativação da página de catálogo de produtos.',
    badge: 'Plano PRO',
  },
  {
    title: 'Mensagens Automáticas',
    description:
      'Envio automático de mensagens de cobrança. Exige WhatsApp conectado e plano PRO/TRIAL.',
    badge: 'Plano PRO',
  },
  {
    title: 'WhatsApp',
    description: 'Conexão e status do WhatsApp da empresa via Evolution API.',
  },
  {
    title: 'Parcelamento',
    description: 'Limites de parcelas e taxas de juros por modalidade.',
  },
  {
    title: 'Boletos',
    description: 'Ativação da emissão de boletos bancários (requer autorização comercial).',
  },
  {
    title: 'Taxas de Cartão',
    description: 'Taxas por adquirente, bandeira e modalidade de pagamento.',
  },
  {
    title: 'Notificações',
    description: 'Preferências de alertas e notificações do sistema.',
  },
  {
    title: 'Administração',
    description:
      'Recursos administrativos: token IBPT global (admin) ou gestão de empresas e troca de senhas (gestor).',
    badge: 'Admin/Gestor',
  },
];

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  Empresa: <Building2 className="h-5 w-5 text-blue-500" />,
  'Dados Fiscais': <FileText className="h-5 w-5 text-purple-500" />,
  'Certificado Digital': <FileBadge className="h-5 w-5 text-indigo-500" />,
  Catálogo: <BookOpen className="h-5 w-5 text-amber-500" />,
  'Mensagens Automáticas': <MessageSquare className="h-5 w-5 text-pink-500" />,
  WhatsApp: <MessageSquare className="h-5 w-5 text-green-600" />,
  Parcelamento: <CreditCard className="h-5 w-5 text-cyan-500" />,
  Boletos: <Landmark className="h-5 w-5 text-emerald-500" />,
  'Taxas de Cartão': <Percent className="h-5 w-5 text-rose-500" />,
  Notificações: <Bell className="h-5 w-5 text-teal-500" />,
  Administração: <ShieldCheck className="h-5 w-5 text-slate-500" />,
};

export function getSettingsHelpTabs(): PageHelpTab[] {
  return [
    {
      value: 'overview',
      label: 'Visão Geral',
      content: (
        <div className="space-y-6">
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20">
            <CardHeader>
              <CardTitle className="text-xl">Configurações</CardTitle>
              <CardDescription>
                A página <strong>/settings</strong> é um hub com cards para todas as categorias
                disponíveis ao seu perfil. Clique em um card para abrir a subpágina correspondente;
                cada categoria carrega e salva de forma independente.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">As 11 categorias</CardTitle>
              <CardDescription>
                O hub lista apenas as categorias visíveis para o seu papel. Cartas bloqueadas
                exibem o motivo (<em>lockReason</em>) e não disparam nenhuma requisição de
                atualização.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {CATEGORY_HELP.map((category, index) => (
                  <li
                    key={category.title}
                    className="flex items-start gap-3 rounded-md border bg-muted/30 p-3"
                  >
                    <div className="mt-1" aria-hidden>
                      {CATEGORY_ICONS[category.title]}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold">{category.title}</h4>
                        {category.badge ? (
                          <Badge variant="secondary" className="text-xs">
                            {category.badge}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como o hub funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Hub como página-menu:</strong> a rota <code>/settings</code> mostra uma
                grade de cards com ícone, título e descrição. Não há um formulário único: cada
                categoria tem sua própria subrota.
              </p>
              <p>
                <strong>Navegação local:</strong> ao abrir uma subcategoria, o shell exibe um menu
                lateral persistente em telas <code>≥lg</code> e um <code>Select</code> compacto em
                telas menores, ambos alimentados pela mesma lista de categorias visíveis.
              </p>
              <p>
                <strong>Cards bloqueados:</strong> categorias com plano/permissão insuficiente
                aparecem com cadeado e o motivo do bloqueio, sem permitir a entrada e sem disparar
                mutações no backend.
              </p>
              <p>
                <strong>Salvamento independente:</strong> cada subpágina carrega e salva apenas os
                seus próprios dados — não há um botão &quot;Salvar tudo&quot;.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Building2 className="h-5 w-5 text-blue-500" />}
              title="Hub como página-menu"
              description="Cards clicáveis substituem a antiga página monolítica; cada card abre uma subpágina dedicada."
              delay={0 * STAGGER}
            />
            <FeatureCard
              icon={<Settings className="h-5 w-5 text-slate-500" />}
              title="Menu local responsivo"
              description="Sidebar persistente em desktop e Select compacto em mobile para alternar entre categorias sem voltar ao hub."
              delay={1 * STAGGER}
            />
            <FeatureCard
              icon={<Lock className="h-5 w-5 text-orange-500" />}
              title="Bloqueios explícitos"
              description="Quando uma categoria exige plano PRO ou autorização comercial, ela continua visível com a explicação do bloqueio."
              delay={2 * STAGGER}
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
              title="Salvamento por categoria"
              description="Alterar fiscal, certificado, WhatsApp ou taxas não interfere nas outras áreas: cada uma persiste quando você salva."
              delay={3 * STAGGER}
            />
          </div>
        </div>
      ),
    },
    {
      value: 'howto',
      label: 'Como usar',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Navegar pelo hub</CardTitle>
              <CardDescription>
                Use o hub como ponto de entrada para todas as configurações da conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StepItem
                number={1}
                text="Abra Configurações no menu lateral para visualizar os cards disponíveis ao seu perfil."
              />
              <StepItem
                number={2}
                text="Clique em um card navegável para abrir a subpágina correspondente; cards bloqueados exibem apenas a explicação do bloqueio."
                emphasis="Em Empresa, 10 categorias ficam visíveis (Catálogo, Mensagens Automáticas e Boletos podem aparecer bloqueadas conforme plano/permissão)."
              />
              <StepItem
                number={3}
                text="Dentro de uma subpágina, use o menu lateral (desktop) ou o Select (mobile) para alternar entre categorias sem voltar ao hub."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atualizar Empresa e aparência</CardTitle>
              <CardDescription>
                Dados do usuário logado, segurança e identidade visual da empresa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StepItem
                number={1}
                text="Na aba Meu perfil, atualize nome, e-mail e telefone; use o campo de senha para trocar a credencial."
              />
              <StepItem
                number={2}
                text="Na aba Segurança, altere a senha e confirme. Você será deslogado após a troca."
              />
              <StepItem
                number={3}
                text="A aba Dados da empresa (apenas papel empresa) traz CNPJ, endereço, logo, apelido e cor da marca — salva de forma independente das demais categorias."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurar fiscal e certificado</CardTitle>
              <CardDescription>
                Necessário para emissão de NF-e/NFC-e.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StepItem
                number={1}
                text="Em Dados Fiscais preencha regime, IE, IM, CNAE, ambiente SEFAZ, séries e CSC/ID Token para NFC-e."
              />
              <StepItem
                number={2}
                text="Em Certificado Digital faça upload do .pfx e informe a senha; o arquivo fica armazenado de forma segura."
                emphasis="Alterações em Dados Fiscais não trocam o certificado em uso, e vice-versa."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catálogo, Mensagens, WhatsApp e Boletos</CardTitle>
              <CardDescription>
                Recursos com regras comerciais ou operacionais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StepItem
                number={1}
                text="Catálogo e Mensagens Automáticas exigem plano PRO/TRIAL; o card mostra o motivo se a empresa não estiver habilitada."
              />
              <StepItem
                number={2}
                text="WhatsApp concentra a conexão via Evolution API; com WhatsApp conectado, é possível ativar mensagens automáticas de cobrança."
              />
              <StepItem
                number={3}
                text="Boletos exige autorização comercial (boletoAllowed). A categoria aparece bloqueada com a explicação caso a empresa não tenha permissão."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxas, Parcelamento e Notificações</CardTitle>
              <CardDescription>
                Categorias sem dependências externas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StepItem
                number={1}
                text="Taxas de Cartão lista adquirentes, bandeiras e modalidades; cadastre uma taxa por vez e salve."
              />
              <StepItem
                number={2}
                text="Parcelamento define o número máximo de parcelas e os juros aplicados."
              />
              <StepItem
                number={3}
                text="Notificações centraliza preferências de alertas; para admin e gestor continua exibindo as opções relevantes ao papel."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Administração</CardTitle>
              <CardDescription>
                Apenas admin e gestor veem esta categoria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StepItem
                number={1}
                text="Admin gerencia o token IBPT global e demais credenciais administrativas."
              />
              <StepItem
                number={2}
                text="Gestor visualiza a lista de empresas vinculadas e pode trocar senhas; no desktop o modal Focus NFe permanece disponível."
              />
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      value: 'tips',
      label: 'Dicas',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Boas práticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <TipItem
                  icon={<FileText className="h-4 w-4 text-blue-500" />}
                  text="Mantenha dados fiscais sempre atualizados; alterações legais podem exigir atualização."
                />
                <TipItem
                  icon={<FileBadge className="h-4 w-4 text-indigo-500" />}
                  text="O certificado A1 e a senha são credenciais sensíveis; não compartilhe com terceiros."
                />
                <TipItem
                  icon={<Bell className="h-4 w-4 text-teal-500" />}
                  text="Revise as preferências de notificações para receber apenas os alertas relevantes ao seu papel."
                />
                <TipItem
                  icon={<Percent className="h-4 w-4 text-rose-500" />}
                  text="Atualize as taxas de cartão sempre que a adquirente mudar condições; o efeito é imediato no PDV."
                />
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Problemas comuns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TroubleshootItem
                problem="Erro ao emitir nota: dados fiscais incompletos"
                solution="Abra /settings/dados-fiscais e preencha CNPJ, IE, IM, CNAE, CEP, CSC (NFC-e), ambiente SEFAZ; em /settings/certificado-digital mantenha o A1 e a senha atualizados."
              />
              <TroubleshootItem
                problem="Card de categoria aparece bloqueado"
                solution="O motivo é exibido no próprio card. Para Catálogo e Mensagens Automáticas é preciso plano PRO/TRIAL; para Boletos é preciso autorização comercial (boletoAllowed)."
              />
              <TroubleshootItem
                problem="Alterações não persistem"
                solution="Cada categoria salva de forma independente. Verifique se há mensagens de erro (toast) após clicar em Salvar e revise a conexão com a API."
              />
              <TroubleshootItem
                problem="URL antiga /settings/card-rates não abre mais"
                solution="A rota legada redireciona automaticamente para /settings/taxas-cartao."
              />
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];
}
