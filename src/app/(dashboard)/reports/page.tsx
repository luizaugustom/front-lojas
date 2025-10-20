'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Download, FileText, Calendar, Package, ShoppingCart, FileBarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { GenerateReportDto, ReportHistory } from '@/types';

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
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [selectedType, setSelectedType] = useState<string>('complete');
  const [selectedFormat, setSelectedFormat] = useState<string>('excel');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
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
  const response = await api.post('/reports/generate', data, { responseType: 'blob' });
      
      const blob = response.data;
      const extension = getFileExtension(data.format);
      const filename = `relatorio-${data.reportType}-${Date.now()}.${extension}`;
      
      downloadFile(blob, filename);

      // Add to history
      const newHistoryItem: ReportHistory = {
        id: Date.now().toString(),
        type: data.reportType,
        format: data.format,
        date: new Date().toISOString(),
        size: blob.size,
        filename,
      };
      setHistory([newHistoryItem, ...history]);

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios Contábeis</h1>
        <p className="text-muted-foreground">
          Gere relatórios completos para envio à contabilidade
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gerar Novo Relatório
            </CardTitle>
            <CardDescription>
              Selecione o tipo de relatório e o formato desejado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <SelectValue />
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
                    <SelectValue />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input id="startDate" type="date" {...register('startDate')} disabled={loading} />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">{errors.startDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input id="endDate" type="date" {...register('endDate')} disabled={loading} />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellerId">Filtrar por Vendedor (Opcional)</Label>
                <Input
                  id="sellerId"
                  placeholder="ID do vendedor"
                  {...register('sellerId')}
                  disabled={loading}
                />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Histórico
            </CardTitle>
            <CardDescription>Relatórios gerados recentemente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <Card key={type.value} className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <type.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="font-medium text-sm">{type.label.replace('Relatório de ', '')}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {type.value === 'sales' && 'Vendas e faturamento'}
                {type.value === 'products' && 'Estoque e movimentação'}
                {type.value === 'invoices' && 'Documentos fiscais'}
                {type.value === 'complete' && 'Todos os dados'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
