"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, RefreshCw, Search, Download, Upload, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, InputWithIcon } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDateTime, downloadFile } from '@/lib/utils';
import { fiscalApi } from '@/lib/api-endpoints';

interface InboundDoc {
  id: string;
  supplierName?: string;
  accessKey?: string;
  status?: string;
  total?: number;
  documentType?: string; // NFE_INBOUND, ENTRADA, etc. depende da API
  createdAt?: string;
}

export default function InboundInvoicesPage() {
  const { api, user } = useAuth();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Protege rota para empresa
  useEffect(() => {
    if (user && user.role !== 'empresa') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inbound-fiscal', search],
    queryFn: async () => (await api.get('/fiscal', { params: { search, documentType: 'inbound' } })).data,
  });

  const docs: InboundDoc[] = useMemo(() => {
    const raw: any = data;
    const list: any[] = Array.isArray(raw) ? raw : raw?.data || raw?.documents || raw?.items || [];
    // Se a API não filtrar por documentType, filtramos aqui por heurística
    return list.filter((d) => {
      const t = (d.documentType || '').toString().toLowerCase();
      // heurísticas comuns para entrada
      return t.includes('entrada') || t.includes('inbound') || t.includes('compra') || t.includes('purchase');
    });
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notas Fiscais de Entrada</h1>
          <p className="text-muted-foreground">Acompanhe as notas de compra/entrada (XML) recebidas</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'empresa' && (
            <Button onClick={() => setAddOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          )}
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <InputWithIcon
          placeholder="Buscar por fornecedor, chave de acesso, status..."
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
              <th className="px-4 py-2 text-left">Fornecedor</th>
              <th className="px-4 py-2 text-left">Chave de Acesso</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-left">Recebida em</th>
              <th className="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={6}>Carregando...</td>
              </tr>
            ) : docs.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={6}>
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                    <span>Nenhuma nota de entrada encontrada</span>
                  </div>
                </td>
              </tr>
            ) : (
              docs.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="px-4 py-2">{doc.supplierName || '-'}</td>
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
                            const response = await api.get(`/fiscal/${doc.id}/download`, { params: { format: 'xml' }, responseType: 'blob' });
                            const blob = response.data as Blob;
                            downloadFile(blob, `nfe-entrada-${doc.id}.xml`);
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

      {/* Dialogo para adicionar nota de entrada via XML */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nota de Entrada</DialogTitle>
            <DialogDescription>Envie um arquivo XML de NF-e de entrada para processamento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="xmlFile">Arquivo XML</Label>
              <Input
                id="xmlFile"
                type="file"
                accept=".xml,application/xml,text/xml"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    // Validar extensão
                    if (!file.name.toLowerCase().endsWith('.xml')) {
                      toast.error('Selecione um arquivo .xml');
                      e.currentTarget.value = '';
                      setXmlFile(null);
                      return;
                    }
                    
                    // Validar tipo MIME
                    const validMimeTypes = ['application/xml', 'text/xml'];
                    if (!validMimeTypes.includes(file.type)) {
                      toast.error('Arquivo deve ser um XML válido (application/xml ou text/xml)');
                      e.currentTarget.value = '';
                      setXmlFile(null);
                      return;
                    }
                    
                    // Validar tamanho máximo (10MB)
                    const maxSize = 10 * 1024 * 1024; // 10MB
                    if (file.size > maxSize) {
                      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
                      e.currentTarget.value = '';
                      setXmlFile(null);
                      return;
                    }
                  }
                  setXmlFile(file || null);
                }}
              />
              {xmlFile && (
                <p className="text-xs text-muted-foreground">Selecionado: {xmlFile.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={uploading}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!xmlFile) {
                  toast.error('Selecione um arquivo XML primeiro');
                  return;
                }
                try {
                  setUploading(true);
                  await fiscalApi.uploadXml(xmlFile, 'inbound');
                  toast.success('XML de nota fiscal de entrada enviado com sucesso');
                  setAddOpen(false);
                  setXmlFile(null);
                  refetch();
                } catch (error: any) {
                  console.error(error);
                  const errorMessage = error.message || 'Falha ao enviar XML';
                  toast.error(errorMessage);
                } finally {
                  setUploading(false);
                }
              }}
              disabled={!xmlFile || uploading}
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Enviar XML
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
