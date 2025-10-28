'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Download, FileText, Calendar, Package, ShoppingCart, FileBarChart, Users, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { reportSchema } from '@/lib/validations';
import { downloadFile, getFileExtension } from '@/lib/utils';
import type { GenerateReportDto, ReportHistory, Seller } from '@/types';

const reportTypes = [
  { value: 'sales', label: 'Relatório de Vendas', icon: ShoppingCart },
  { value: 'products', label: 'Relatório de Produtos', icon: Package },
  { value: 'invoices', label: 'Relatório de Notas Fiscais', icon: FileText },
  { value: 'complete', label: 'Relatório Completo', icon: FileBarChart },
];

const formats = [
  { value: 'excel', label: 'Excel (.xlsx)' },
  { value: 'xml', label: 'XML' },
  { value: 'json', label: 'JSON' },
];

export default function ReportsPage() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [selectedType, setSelectedType] = useState<string>('complete');
  const [selectedFormat, setSelectedFormat] = useState<string>('excel');
  const [selectedSeller, setSelectedSeller] = useState<string>('all');

  // Carregar vendedores para o filtro
  const { data: sellersData } = useQuery({
    queryKey: ['sellers'],
    queryFn: async () => (await api.get('/seller')).data,
    enabled: user?.role === 'empresa',
  });

  const sellers: Seller[] = sellersData || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<GenerateReportDto>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: 'complete',
      format: 'excel',
    },
  });

  const onSubmit = async (data: GenerateReportDto) => {
    setLoading(true);
    try {
      // Preparar dados convertendo datas vazias para undefined
      const payload = {
        ...data,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        sellerId: data.sellerId === 'all' ? undefined : data.sellerId || undefined,
      };

      // Fazer requisição com responseType blob
      const response = await api.post('/reports/generate', payload, {
        responseType: 'blob',
      });

      // Criar blob a partir da resposta
      let blob: Blob;
      if (response.data instanceof Blob) {
        blob = response.data;
      } else {
        // Se não for blob, converter
        blob = new Blob([response.data], {
          type: response.headers['content-type'] || 'application/octet-stream',
        });
      }

      // Determinar extensão e nome do arquivo
      const extension = getFileExtension(data.format);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `relatorio-${data.reportType}-${timestamp}.${extension}`;

      // Fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      // Adicionar ao histórico
      const newHistoryItem: ReportHistory = {
        id: Date.now().toString(),
        type: data.reportType,
        format: data.format,
        date: new Date().toISOString(),
        size: blob.size,
        filename,
      };
      setHistory([newHistoryItem, ...history]);

      toast.success('Relatório gerado e baixado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      
      // Tratamento especial para erros de blob
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          toast.error(errorData.message || 'Erro ao gerar relatório');
        } catch {
          toast.error('Erro ao gerar relatório');
        }
      } else {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full h-fit -mb-2 sm:-mb-4 lg:-mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios Contábeis</h1>
        <p className="text-muted-foreground">
          Gere relatórios completos para envio à contabilidade
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 w-full">
        {/* Form Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gerar Novo Relatório
            </CardTitle>
            <CardDescription>
              Selecione o tipo de relatório e o formato desejado
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    setValue('reportType', value as any);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.reportType && (
                  <p className="text-sm text-destructive">{errors.reportType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Formato</Label>
                <Select
                  value={selectedFormat}
                  onValueChange={(value) => {
                    setSelectedFormat(value);
                    setValue('format', value as any);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.format && (
                  <p className="text-sm text-destructive">{errors.format.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                        placeholder="Selecione a data inicial"
                        disabled={loading}
                      />
                    )}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">{errors.startDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                        placeholder="Selecione a data final"
                        disabled={loading}
                      />
                    )}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Filtrar por Vendedor (Opcional)
                </Label>
                <Select
                  value={selectedSeller}
                  onValueChange={(value) => {
                    setSelectedSeller(value);
                    setValue('sellerId', value || undefined);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os vendedores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os vendedores</SelectItem>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.name} {seller.commissionRate && seller.commissionRate > 0 ? `(${seller.commissionRate}%)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para incluir todos os vendedores
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Gerar e Baixar Relatório
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Section */}
        <Card className="flex flex-col h-fit max-h-[450px]">
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Histórico
            </CardTitle>
            <CardDescription>Relatórios gerados recentemente</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-0 pb-3">
            <div className="space-y-1.5">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum relatório gerado ainda
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm capitalize">
                        {reportTypes.find((t) => t.value === item.type)?.label}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded">
                        {item.format}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(item.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 w-full">
        {reportTypes.map((type) => (
          <Card key={type.value} className={`cursor-pointer transition-all hover:shadow-md ${selectedType === type.value ? 'ring-2 ring-primary' : ''}`}
            onClick={() => {
              setSelectedType(type.value);
              setValue('reportType', type.value as any);
            }}
          >
            <CardContent className="py-2 px-3">
              <div className="flex justify-center mb-0.5">
                <div className={`rounded-full p-1.5 ${selectedType === type.value ? 'bg-primary text-primary-foreground' : 'bg-primary/10'}`}>
                  <type.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="font-medium text-sm text-center leading-tight">{type.label.replace('Relatório de ', '')}</div>
              <div className="text-xs text-muted-foreground mt-0 text-center leading-tight">
                {type.value === 'sales' && 'Vendas e faturamento'}
                {type.value === 'products' && 'Estoque e movimentação'}
                {type.value === 'invoices' && 'Documentos fiscais'}
                {type.value === 'complete' && 'Todos os dados + comissões'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações sobre o Relatório Completo */}
      {selectedType === 'complete' && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="py-2 px-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-0.5 text-sm">
                  O Relatório Completo inclui:
                </h3>
                <ul className="space-y-0 text-xs text-blue-800 dark:text-blue-300 leading-tight">
                  <li>✓ <strong>Vendas:</strong> Todas as vendas do período com detalhes</li>
                  <li>✓ <strong>Produtos:</strong> Estoque, preços e movimentações</li>
                  <li>✓ <strong>Notas Fiscais:</strong> Documentos emitidos</li>
                  <li>✓ <strong>Contas a Pagar:</strong> Obrigações financeiras</li>
                  <li>✓ <strong>Fechamentos de Caixa:</strong> Histórico de fechamentos</li>
                  <li>✓ <strong>💰 Comissões:</strong> Cálculo detalhado por vendedor</li>
                </ul>
                <p className="mt-1 mb-0 text-xs text-blue-700 dark:text-blue-400">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Ideal para envio à contabilidade com todos os dados necessários!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
