'use client';

import { Clock, ScanLine, MapPin, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FeatureCard,
  StepItem,
  TipItem,
  TroubleshootItem,
  type PageHelpTab,
} from '../page-help-modal';

const STAGGER = 50;

export const timeClockHelpTitle = 'Central de Ajuda - Ponto Eletrônico';
export const timeClockHelpDescription =
  'Bata ponto por QR Code e geolocalização, com aprovação automática ou manual.';
export const timeClockHelpIcon = (
  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
);

export function getTimeClockHelpTabs(): PageHelpTab[] {
  return [
    {
      value: 'overview',
      label: 'Visão Geral',
      content: (
        <div className="space-y-6">
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20">
            <CardHeader>
              <CardTitle className="text-xl">Ponto Eletrônico</CardTitle>
              <CardDescription>
                Registre a jornada de trabalho (entrada, almoço, saída) com
                validação por QR Code e geolocalização da loja.
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Clock className="h-5 w-5 text-blue-500" />}
              title="4 marcações por dia"
              description="Entrada, Saída Almoço, Volta Almoço e Saída. O sistema infere qual é a próxima."
              delay={0 * STAGGER}
            />
            <FeatureCard
              icon={<MapPin className="h-5 w-5 text-emerald-500" />}
              title="Geolocalização"
              description="Calculamos a distância até a loja. Pontos dentro do raio são válidos automaticamente."
              delay={1 * STAGGER}
            />
            <FeatureCard
              icon={<ScanLine className="h-5 w-5 text-purple-500" />}
              title="QR estático"
              description="QR único por loja. Pode ser exigido ou opcional conforme configuração."
              delay={2 * STAGGER}
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5 text-amber-500" />}
              title="Aprovação de exceções"
              description="Pontos fora do raio ficam pendentes e aguardam aprovação da empresa."
              delay={3 * STAGGER}
            />
            <FeatureCard
              icon={<FileText className="h-5 w-5 text-indigo-500" />}
              title="Relatórios"
              description="Espelho mensal em PDF/CSV integrado à página de relatórios contábeis."
              delay={4 * STAGGER}
            />
            <FeatureCard
              icon={<AlertCircle className="h-5 w-5 text-red-500" />}
              title="Notificações"
              description="Lembretes de horário, atrasos e pontos faltantes no app e desktop."
              delay={5 * STAGGER}
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
              <CardTitle>Para o funcionário (bater ponto)</CardTitle>
              <CardDescription>
                Funciona no celular (câmera + GPS) e no desktop (Electron).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StepItem
                number={1}
                text="Abra a página Ponto Eletrônico. Permita o acesso à câmera e à localização quando o navegador pedir."
              />
              <StepItem
                number={2}
                text="Escaneie o QR da loja (se exigido). Toque em 'Bater ponto' e a câmera será aberta."
              />
              <StepItem
                number={3}
                text="Confirme a marcação. O backend valida GPS + QR e grava com horário, distância e status."
              />
              <StepItem
                number={4}
                text="Acompanhe suas estatísticas: horas trabalhadas, extras, atrasos e dias completos."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Para a empresa (aprovação e relatórios)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StepItem
                number={1}
                text="Configure a loja: em 'Config. Ponto' informe latitude/longitude, raio e regras."
              />
              <StepItem
                number={2}
                text="Aprove pontos pendentes: revise cada marcação fora do raio e aprove/rejeite."
              />
              <StepItem
                number={3}
                text="Gere o espelho mensal em Relatórios Contábeis > Relatório de Ponto Eletrônico."
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
        <Card>
          <CardHeader>
            <CardTitle>Boas práticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TipItem icon="📍" text="Configure o raio ideal: galpões 100-150m, escritórios 30-50m." />
            <TipItem icon="📱" text="Use QR obrigatório em locais públicos (shoppings)." />
            <TipItem icon="⏰" text="Configure os 4 horários de marcação para receber notificações." />
            <TipItem icon="✅" text="Revise pendentes diariamente em 'Aprovar Pontos'." />
          </CardContent>
        </Card>
      ),
    },
    {
      value: 'troubleshoot',
      label: 'Problemas',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Solução de problemas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TroubleshootItem
              problem="Permissão de localização negada"
              solution="Acesse as configurações do navegador, localize este site e habilite Localização."
            />
            <TroubleshootItem
              problem="QR inválido ou adulterado"
              solution="A empresa deve rotacionar o QR em 'Config. Ponto' > Rotacionar. O token anterior é invalidado."
            />
            <TroubleshootItem
              problem="Ponto fora do raio"
              solution="Verifique a precisão do GPS. Aprovações manuais ficam em 'Aprovar Pontos'."
            />
            <TroubleshootItem
              problem="Não recebo notificações"
              solution="Verifique 'Lembretes automáticos' em Config. Ponto e as permissões de notificação do navegador."
            />
          </CardContent>
        </Card>
      ),
    },
  ];
}