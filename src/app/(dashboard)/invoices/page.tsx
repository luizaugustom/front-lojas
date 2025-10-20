"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, RefreshCw, Search, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, InputWithIcon } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency, formatDateTime, downloadFile } from '@/lib/utils';

interface FiscalDoc {
  id: string;
  documentType: 'NFE' | 'NFSE' | string;
  accessKey?: string;
  status?: string;
  total?: number;
  createdAt?: string;
}

export default function InvoicesPage() {
  const { api, user } = useAuth();
  const [search, setSearch] = useState('');
  const [emitOpen, setEmitOpen] = useState(false);
  const [emitType, setEmitType] = useState<'nfe' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Campos opcionais (ajuste conforme sua API exigir)
  const [saleId, setSaleId] = useState(''); // Para NF-e (vincular a uma venda existente)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fiscal', search],
    queryFn: async () => (await api.get('/fiscal', { params: { search } })).data,
  });

  // Protege rota: apenas empresa deve ver
  useEffect(() => {
    if (user && user.role !== 'empresa') {
      // Redireciono via location para evitar uso de router no layout client
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Tenta normalizar possíveis formatos de resposta
  const raw = data as any;
  const documents: FiscalDoc[] = Array.isArray(raw)
    ? raw
    : raw?.data || raw?.documents || raw?.items || [];

  const openEmitDialog = (type: 'nfe') => {
    setEmitType(type);
    // Reset campos
    setSaleId('');
    setEmitOpen(true);
  };

  const submitEmit = async () => {
    if (!emitType) return;
    setSubmitting(true);
    try {
      const payload: any = {};
      if (saleId.trim()) payload.saleId = saleId.trim();
      await api.post('/fiscal/nfe', payload);
      toast.success('NF-e emitida com sucesso');
      setEmitOpen(false);
      refetch();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notas Fiscais</h1>
          <p className="text-muted-foreground">Visualize e baixe suas NF-e</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'empresa' && (
            <Button onClick={() => openEmitDialog('nfe')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Emitir NF-e
            </Button>
          )}
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <InputWithIcon
          placeholder="Buscar por chave de acesso, tipo, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
          iconPosition="left"
        />
      </Card>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Chave de Acesso</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-left">Emissão</th>
              <th className="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={6}>Carregando...</td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={6}>
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                    <span>Nenhum documento fiscal encontrado</span>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="px-4 py-2">{doc.documentType}</td>
                  <td className="px-4 py-2 font-mono text-xs">{doc.accessKey || '-'}</td>
                  <td className="px-4 py-2">{doc.status || '-'}</td>
                  <td className="px-4 py-2 text-right">{doc.total != null ? formatCurrency(doc.total) : '-'}</td>
                  <td className="px-4 py-2">{doc.createdAt ? formatDateTime(doc.createdAt) : '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const response = await api.get(`/fiscal/${doc.id}/download`, { params: { format: 'pdf' }, responseType: 'blob' });
                            const blob = response.data as Blob;
                            downloadFile(blob, `documento-${doc.id}.pdf`);
                          } catch (e) {
                            console.error(e);
                            alert('Não foi possível baixar o PDF');
                          }
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" /> PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const response = await api.get(`/fiscal/${doc.id}/download`, { params: { format: 'xml' }, responseType: 'blob' });
                            const blob = response.data as Blob;
                            downloadFile(blob, `documento-${doc.id}.xml`);
                          } catch (e) {
                            console.error(e);
                            alert('Não foi possível baixar o XML');
                          }
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" /> XML
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialogo para emissão */}
      <Dialog open={emitOpen} onOpenChange={setEmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Emitir NF-e
            </DialogTitle>
            <DialogDescription>
              Preencha os campos opcionais abaixo. Se não souber, pode prosseguir com os dados mínimos que o backend exigir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="saleId">ID da Venda (opcional)</Label>
              <Input id="saleId" placeholder="Ex.: 123" value={saleId} onChange={(e) => setSaleId(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEmitOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={submitEmit} disabled={submitting}>
              {submitting ? 'Emitindo...' : 'Emitir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
