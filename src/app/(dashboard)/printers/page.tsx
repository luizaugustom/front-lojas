'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Printer, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  DollarSign,
  TestTube,
  Wifi,
  Usb,
  Bluetooth,
  Download,
  Settings,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { printerApi } from '@/lib/api-endpoints';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/error-handler';
import { DriverInstallModal } from '@/components/printer/driver-install-modal';

interface SystemPrinter {
  name: string;
  driver: string;
  port: string;
  status: 'online' | 'offline' | 'error' | 'paper-empty';
  isDefault: boolean;
  connection: 'usb' | 'network' | 'bluetooth' | 'local';
}

interface DBPrinter {
  id: string;
  name: string;
  type: string;
  connectionInfo: string;
  isConnected: boolean;
  paperStatus: string;
  lastStatusCheck: string | null;
  company: {
    id: string;
    name: string;
  };
}

interface DriverInfo {
  name: string;
  installed: boolean;
  version?: string;
  compatible: boolean;
}

export default function PrintersPage() {
  const [systemPrinters, setSystemPrinters] = useState<SystemPrinter[]>([]);
  const [dbPrinters, setDBPrinters] = useState<DBPrinter[]>([]);
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [checkingDrivers, setCheckingDrivers] = useState(false);
  const [testingPrinter, setTestingPrinter] = useState<string | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [logsModal, setLogsModal] = useState<{ open: boolean; printer?: DBPrinter; logs: string[] }>()
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; printer?: DBPrinter }>()
  const [testModal, setTestModal] = useState<{ open: boolean; selectedId?: string }>()

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSystemPrinters(),
        loadDBPrinters(),
      ]);
    } catch (error) {
      console.error('[Printers] Erro ao carregar dados:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemPrinters = async () => {
    try {
      const response = await printerApi.available();
      setSystemPrinters(response.data || []);
    } catch (error) {
      console.error('[Printers] Erro ao carregar impressoras do sistema:', error);
    }
  };

  const loadDBPrinters = async () => {
    try {
      const response = await printerApi.list();
      setDBPrinters(response.data || []);
    } catch (error) {
      console.error('[Printers] Erro ao carregar impressoras cadastradas:', error);
    }
  };

  const handleDiscover = async () => {
    try {
      setDiscovering(true);
      toast.info('Descobrindo impressoras...');
      
      const response = await printerApi.discover();
      const discovered = response.data || [];
      
      setSystemPrinters(discovered);
      toast.success(`${discovered.length} impressora(s) encontrada(s)!`);
      
      // Recarrega impressoras do banco
      await loadDBPrinters();
    } catch (error) {
      console.error('[Printers] Erro ao descobrir impressoras:', error);
      handleApiError(error);
    } finally {
      setDiscovering(false);
    }
  };

  const handleCheckDrivers = async () => {
    try {
      setCheckingDrivers(true);
      toast.info('Verificando drivers...');
      
      const response = await printerApi.checkDrivers();
      const result = response.data;
      
      // Atualiza lista de drivers
      setDrivers(result.drivers || []);
      
      // Abre o modal
      setShowDriverModal(true);
      
      // Mostra mensagem apropriada
      if (result.allInstalled) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      console.error('[Printers] Erro ao verificar drivers:', error);
      handleApiError(error);
    } finally {
      setCheckingDrivers(false);
    }
  };

  const handleInstallDrivers = async () => {
    try {
      toast.info('Instalando drivers...');
      
      const response = await printerApi.installDrivers();
      const result = response.data;
      
      if (result.success) {
        toast.success(result.message);
        
        // Recarrega os drivers após instalação
        const checkResponse = await printerApi.checkDrivers();
        setDrivers(checkResponse.data.drivers || []);
      } else {
        toast.error(result.message, {
          description: result.errors.join(', '),
        });
      }
    } catch (error) {
      console.error('[Printers] Erro ao instalar drivers:', error);
      handleApiError(error);
    }
  };

  const handleTestPrinter = async (printerId: string) => {
    try {
      setTestingPrinter(printerId);
      toast.info('Enviando teste de impressão...');
      
      const response = await printerApi.test(printerId);
      
      if (response.data.success) {
        toast.success('Teste de impressão enviado com sucesso!');
      } else {
        toast.error('Falha no teste de impressão');
      }
    } catch (error) {
      console.error('[Printers] Erro ao testar impressora:', error);
      handleApiError(error);
    } finally {
      setTestingPrinter(null);
    }
  };

  const handleAddPrinter = async (printer: SystemPrinter) => {
    try {
      toast.info('Cadastrando impressora...');
      
      await printerApi.create({
        name: printer.name,
        type: printer.connection,
        connectionInfo: printer.port,
      });
      
      toast.success('Impressora cadastrada com sucesso!');
      await loadDBPrinters();
    } catch (error) {
      console.error('[Printers] Erro ao cadastrar impressora:', error);
      handleApiError(error);
    }
  };

  const handleOpenDrawer = async (printerId: string) => {
    try {
      toast.info('Abrindo gaveta...');
      
      const response = await printerApi.openDrawer(printerId);
      
      if (response.data.success) {
        toast.success('Gaveta aberta com sucesso!');
      } else {
        toast.error('Falha ao abrir gaveta');
      }
    } catch (error) {
      console.error('[Printers] Erro ao abrir gaveta:', error);
      handleApiError(error);
    }
  };

  const handleDeletePrinter = (printer: DBPrinter) => {
    setDeleteConfirm({ open: true, printer });
  };

  const confirmDeletePrinter = async () => {
    if (!deleteConfirm?.printer) return;
    try {
      await printerApi.delete(deleteConfirm.printer.id);
      toast.success('Impressora excluída com sucesso!');
      setDeleteConfirm({ open: false });
      await loadDBPrinters();
    } catch (error) {
      console.error('[Printers] Erro ao excluir impressora:', error);
      handleApiError(error);
    }
  };

  const handleShowLogs = async (printer: DBPrinter) => {
    try {
      toast.info('Carregando logs...');
      const res = await printerApi.logs(printer.id);
      setLogsModal({ open: true, printer, logs: res.data.logs || [] });
    } catch (error) {
      console.error('[Printers] Erro ao obter logs:', error);
      handleApiError(error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'paper-empty':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, paperStatus?: string) => {
    if (paperStatus === 'EMPTY') {
      return <Badge variant="destructive">Sem Papel</Badge>;
    }
    if (paperStatus === 'LOW') {
      return <Badge variant="warning">Papel Baixo</Badge>;
    }
    
    switch (status) {
      case 'online':
        return <Badge variant="success">Online</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'usb':
        return <Usb className="h-4 w-4" />;
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'bluetooth':
        return <Bluetooth className="h-4 w-4" />;
      default:
        return <Printer className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Impressoras</h1>
          <p className="text-muted-foreground">
            Gerencie suas impressoras térmicas e drivers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (dbPrinters.length === 0) {
                toast.error('Nenhuma impressora cadastrada.');
                return;
              }
              setTestModal({ open: true, selectedId: dbPrinters.find(p => p.isConnected)?.id || dbPrinters[0].id });
            }}
            variant="default"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Testar Impressora
          </Button>
          <Button
            onClick={handleCheckDrivers}
            variant="outline"
            disabled={checkingDrivers}
          >
            {checkingDrivers ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Verificar Drivers
          </Button>
          <Button
            onClick={handleDiscover}
            disabled={discovering}
          >
            {discovering ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Descobrir Impressoras
          </Button>
        </div>
      </div>

      {/* Alert de Informações */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema Automático:</strong> O sistema detecta automaticamente impressoras conectadas,
          verifica drivers instalados e mantém o status atualizado a cada 30 segundos.
        </AlertDescription>
      </Alert>

      {/* Impressoras Cadastradas */}
      <Card>
        <CardHeader>
          <CardTitle>Impressoras Cadastradas</CardTitle>
          <CardDescription>
            Impressoras registradas no sistema e prontas para uso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dbPrinters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Printer className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma impressora cadastrada</p>
              <p className="text-sm">Clique em "Descobrir Impressoras" para encontrar impressoras disponíveis</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dbPrinters.map((printer) => (
                <div
                  key={printer.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Printer className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{printer.name}</h3>
                        {getStatusBadge(
                          printer.isConnected ? 'online' : 'offline',
                          printer.paperStatus
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getConnectionIcon(printer.type)}
                        <span>{printer.connectionInfo}</span>
                      </div>
                      {printer.lastStatusCheck && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Última verificação: {new Date(printer.lastStatusCheck).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDrawer(printer.id)}
                      disabled={!printer.isConnected}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Abrir Gaveta
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestPrinter(printer.id)}
                      disabled={!printer.isConnected || testingPrinter === printer.id}
                    >
                      {testingPrinter === printer.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Testar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowLogs(printer)}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Ver Logs
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePrinter(printer)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impressoras Disponíveis no Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Impressoras Disponíveis no Sistema</CardTitle>
          <CardDescription>
            Impressoras detectadas conectadas ao computador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemPrinters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma impressora encontrada</p>
              <p className="text-sm">Conecte uma impressora e clique em "Descobrir Impressoras"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {systemPrinters.map((printer, index) => {
                const isRegistered = dbPrinters.some(p => p.name === printer.name);
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(printer.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{printer.name}</h3>
                          {printer.isDefault && (
                            <Badge variant="default">Padrão</Badge>
                          )}
                          {getStatusBadge(printer.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getConnectionIcon(printer.connection)}
                          <span>{printer.port}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Driver: {printer.driver}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isRegistered ? (
                        <Badge variant="secondary">Cadastrada</Badge>
                      ) : (
                        <Button
                          onClick={() => handleAddPrinter(printer)}
                          size="sm"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Cadastrar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dicas de Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas de Solução de Problemas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Impressora não aparece?</strong>
                <p className="text-muted-foreground">
                  Verifique se está ligada e conectada ao computador. Tente reconectar e clicar em "Descobrir Impressoras".
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Erro ao imprimir?</strong>
                <p className="text-muted-foreground">
                  Clique em "Verificar Drivers" para instalar drivers necessários. Pode ser necessário executar como Administrador.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Status offline?</strong>
                <p className="text-muted-foreground">
                  Verifique se a impressora está ligada, com papel e sem erros. O status é atualizado automaticamente a cada 30 segundos.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Impressora de rede?</strong>
                <p className="text-muted-foreground">
                  Certifique-se de que o computador está na mesma rede e que a impressora tem um IP fixo configurado.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Instalação de Drivers */}
      <DriverInstallModal
        open={showDriverModal}
        onClose={() => setShowDriverModal(false)}
        drivers={drivers}
        onInstall={handleInstallDrivers}
        loading={checkingDrivers}
      />

      {/* Modal de Logs */}
      {logsModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setLogsModal({ open: false, logs: [] })} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full m-4 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Logs da Impressora{logsModal?.printer ? `: ${logsModal.printer.name}` : ''}</h2>
              <Button variant="ghost" size="sm" onClick={() => setLogsModal({ open: false, logs: [] })}>Fechar</Button>
            </div>
            {logsModal?.logs?.length ? (
              <pre className="max-h-[60vh] overflow-auto text-sm whitespace-pre-wrap bg-muted p-3 rounded">{logsModal.logs.join('\n')}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">Sem logs recentes.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Seleção para Teste */}
      {testModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setTestModal({ open: false })} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full m-4 p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Selecionar Impressora para Teste</h2>
            <div className="space-y-2 mb-4">
              <label className="text-sm text-muted-foreground">Impressora</label>
              <select
                className="w-full border rounded px-3 py-2 bg-background"
                value={testModal.selectedId}
                onChange={(e) => setTestModal({ open: true, selectedId: e.target.value })}
              >
                {dbPrinters.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isConnected ? '(online)' : '(offline)'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTestModal({ open: false })}>Cancelar</Button>
              <Button
                onClick={async () => {
                  if (!testModal?.selectedId) return;
                  await handleTestPrinter(testModal.selectedId);
                  setTestModal({ open: false });
                }}
              >
                Testar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm({ open: false })} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full m-4 p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Excluir Impressora</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tem certeza que deseja excluir a impressora "{deleteConfirm?.printer?.name}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm({ open: false })}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmDeletePrinter}>Excluir</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


