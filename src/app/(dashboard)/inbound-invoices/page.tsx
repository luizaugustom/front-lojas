"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, RefreshCw, Search, Download, Upload, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, InputWithIcon } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDateTime, downloadFile } from '@/lib/utils';
import { fiscalApi, uploadApi } from '@/lib/api-endpoints';

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
  const [inputMode, setInputMode] = useState<'file' | 'manual'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // XML ou PDF
  const [uploading, setUploading] = useState(false);
  
  // Estado para exclusão
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<InboundDoc | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Campos para entrada manual
  const [accessKey, setAccessKey] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [manualAttachment, setManualAttachment] = useState<File | null>(null); // anexo opcional (PDF ou XML)

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
    // A API já filtra por documentType='inbound', então retornamos diretamente
    return list;
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
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="text-foreground">
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
              <th className="px-4 py-2 text-left text-foreground">Fornecedor</th>
              <th className="px-4 py-2 text-left text-foreground">Chave de Acesso</th>
              <th className="px-4 py-2 text-left text-foreground">Status</th>
              <th className="px-4 py-2 text-right text-foreground">Total</th>
              <th className="px-4 py-2 text-left text-foreground">Recebida em</th>
              <th className="px-4 py-2 text-right text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>Carregando...</td>
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
                  <td className="px-4 py-2 text-foreground">{doc.supplierName || '-'}</td>
                  <td className="px-4 py-2 font-mono text-xs text-foreground">{doc.accessKey || '-'}</td>
                  <td className="px-4 py-2 text-foreground">{doc.status || '-'}</td>
                  <td className="px-4 py-2 text-right text-foreground">{doc.total != null ? formatCurrency(doc.total) : '-'}</td>
                  <td className="px-4 py-2 text-foreground">{doc.createdAt ? formatDateTime(doc.createdAt) : '-'}</td>
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
                      {user?.role === 'empresa' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeletingDoc(doc);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={deleteOpen} onOpenChange={(open) => {
        setDeleteOpen(open);
        if (!open) {
          setDeletingDoc(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta nota fiscal de entrada?
            </DialogDescription>
          </DialogHeader>
          
          {deletingDoc && (
            <div className="space-y-2 py-4">
              <div className="text-sm">
                <span className="font-medium text-foreground">Fornecedor:</span>
                <span className="ml-2 text-muted-foreground">{deletingDoc.supplierName || '-'}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Chave de Acesso:</span>
                <div className="mt-1 font-mono text-xs break-all text-muted-foreground">
                  {deletingDoc.accessKey || '-'}
                </div>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Valor:</span>
                <span className="ml-2 text-muted-foreground">
                  {deletingDoc.total != null ? formatCurrency(deletingDoc.total) : '-'}
                </span>
              </div>
            </div>
          )}
          
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Esta ação não pode ser desfeita. A nota fiscal de entrada será removida permanentemente.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteOpen(false)} 
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deletingDoc) return;
                
                try {
                  setDeleting(true);
                  await api.delete(`/fiscal/inbound-invoice/${deletingDoc.id}`);
                  toast.success('Nota fiscal de entrada excluída com sucesso');
                  setDeleteOpen(false);
                  setDeletingDoc(null);
                  refetch();
                } catch (error: any) {
                  console.error(error);
                  const errorMessage = error.response?.data?.message || error.message || 'Falha ao excluir nota fiscal';
                  toast.error(errorMessage);
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
            >
              {deleting ? (
                <>Excluindo...</>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo para adicionar nota de entrada via XML ou manual */}
      <Dialog open={addOpen} onOpenChange={(open) => {
        setAddOpen(open);
        if (!open) {
          // Limpar campos ao fechar
          setInputMode('manual');
          setSelectedFile(null);
          setAccessKey('');
          setSupplierName('');
          setTotalValue('');
          setManualAttachment(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Nota de Entrada</DialogTitle>
            <DialogDescription>
              {inputMode === 'manual' 
                ? 'Preencha as informações da nota fiscal de entrada manualmente e, se quiser, anexe o PDF/XML.'
                : 'Envie um arquivo XML ou PDF da nota de entrada. XML será processado; PDF será armazenado como anexo.'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Seleção do modo de entrada */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={inputMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setInputMode('manual')}
              className="flex-1"
            >
              Entrada Manual
            </Button>
            <Button
              type="button"
              variant={inputMode === 'file' ? 'default' : 'outline'}
              onClick={() => setInputMode('file')}
              className="flex-1"
            >
              Upload XML/PDF
            </Button>
          </div>

          <div className="space-y-3">
            {inputMode === 'manual' ? (
              <>
                <div className="space-y-1">
                  <Label htmlFor="accessKey">Chave de Acesso *</Label>
                  <Input
                    id="accessKey"
                    placeholder="44 dígitos da chave de acesso"
                    maxLength={44}
                    value={accessKey}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setAccessKey(value);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {accessKey.length}/44 dígitos
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="supplierName">Fornecedor *</Label>
                  <Input
                    id="supplierName"
                    placeholder="Nome do fornecedor"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    maxLength={255}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="totalValue">Valor Total *</Label>
                  <Input
                    id="totalValue"
                    placeholder="0,00"
                    value={totalValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d,]/g, '');
                      setTotalValue(value);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use vírgula para separar os centavos (ex: 1500,50)
                  </p>
                </div>

                {/* Anexo opcional no modo manual */}
                <div className="space-y-1">
                  <Label htmlFor="manualAttachment">Anexo (opcional) - PDF ou XML</Label>
                  <Input
                    id="manualAttachment"
                    type="file"
                    accept=".pdf,application/pdf,.xml,application/xml,text/xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                        const isXml = ['application/xml', 'text/xml'].includes(file.type) || file.name.toLowerCase().endsWith('.xml');
                        if (!isPdf && !isXml) {
                          toast.error('Selecione um arquivo PDF ou XML');
                          e.currentTarget.value = '';
                          setManualAttachment(null);
                          return;
                        }
                        const maxSize = 10 * 1024 * 1024; // 10MB
                        if (file.size > maxSize) {
                          toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
                          e.currentTarget.value = '';
                          setManualAttachment(null);
                          return;
                        }
                      }
                      setManualAttachment(file);
                    }}
                  />
                  {manualAttachment && (
                    <p className="text-xs text-muted-foreground">Anexo: {manualAttachment.name}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="inboundFile">Arquivo XML ou PDF</Label>
                <Input
                  id="inboundFile"
                  type="file"
                  accept=".pdf,application/pdf,.xml,application/xml,text/xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                      const isXml = ['application/xml', 'text/xml'].includes(file.type) || file.name.toLowerCase().endsWith('.xml');
                      if (!isPdf && !isXml) {
                        toast.error('Selecione um arquivo PDF ou XML');
                        e.currentTarget.value = '';
                        setSelectedFile(null);
                        return;
                      }
                      const maxSize = 10 * 1024 * 1024; // 10MB
                      if (file.size > maxSize) {
                        toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
                        e.currentTarget.value = '';
                        setSelectedFile(null);
                        return;
                      }
                    }
                    setSelectedFile(file || null);
                  }}
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">Selecionado: {selectedFile.name}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={uploading}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (inputMode === 'manual') {
                  // Validar campos manuais
                  if (!accessKey || accessKey.length !== 44) {
                    toast.error('Chave de acesso deve ter 44 dígitos');
                    return;
                  }
                  if (!supplierName.trim()) {
                    toast.error('Nome do fornecedor é obrigatório');
                    return;
                  }
                  if (!totalValue.trim()) {
                    toast.error('Valor total é obrigatório');
                    return;
                  }
                  
                  try {
                    setUploading(true);
                    
                    // Converter valor de string para número
                    const totalValueNumber = parseFloat(totalValue.replace(',', '.'));
                    if (isNaN(totalValueNumber) || totalValueNumber < 0) {
                      toast.error('Valor total inválido');
                      return;
                    }
                    // Se houver anexo no manual, subir primeiro e enviar URL junto
                    let attachmentUrl: string | undefined = undefined;
                    if (manualAttachment) {
                      try {
                        const uploaded = await uploadApi.single(manualAttachment);
                        attachmentUrl = uploaded.data?.url;
                      } catch (e) {
                        console.warn('Falha no upload do anexo. Continuando sem anexo.', e);
                      }
                    }
                    await api.post('/fiscal/inbound-invoice', {
                      accessKey,
                      supplierName,
                      totalValue: totalValueNumber,
                      attachmentUrl,
                    });
                    
                    toast.success('Nota fiscal de entrada registrada com sucesso');
                    setAddOpen(false);
                    setAccessKey('');
                    setSupplierName('');
                    setTotalValue('');
                    setManualAttachment(null);
                    refetch();
                  } catch (error: any) {
                    console.error(error);
                    const errorMessage = error.response?.data?.message || error.message || 'Falha ao registrar nota fiscal';
                    toast.error(errorMessage);
                  } finally {
                    setUploading(false);
                  }
                } else {
                  // Modo arquivo (XML ou PDF)
                  if (!selectedFile) {
                    toast.error('Selecione um arquivo XML ou PDF');
                    return;
                  }
                  const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
                  const isXml = ['application/xml', 'text/xml'].includes(selectedFile.type) || selectedFile.name.toLowerCase().endsWith('.xml');
                  try {
                    setUploading(true);
                    if (isXml) {
                      await fiscalApi.uploadXml(selectedFile, 'inbound');
                      toast.success('XML de nota fiscal de entrada enviado e processado com sucesso');
                    } else if (isPdf) {
                      const uploaded = await uploadApi.single(selectedFile);
                      const url = uploaded.data?.url;
                      if (url) {
                        toast.success('PDF enviado e armazenado como anexo');
                      } else {
                        toast.success('PDF enviado');
                      }
                    }
                    setAddOpen(false);
                    setSelectedFile(null);
                    // Atualiza lista apenas se for XML (cria registro). PDF pode não criar registro.
                    if (isXml) refetch();
                  } catch (error: any) {
                    console.error(error);
                    const errorMessage = error.message || 'Falha ao enviar arquivo';
                    toast.error(errorMessage);
                  } finally {
                    setUploading(false);
                  }
                }
              }}
              disabled={
                uploading || (
                  inputMode === 'manual'
                    ? !accessKey || !supplierName || !totalValue
                    : !selectedFile
                )
              }
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Processando...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" /> {inputMode === 'manual' ? 'Adicionar' : 'Enviar Arquivo'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
