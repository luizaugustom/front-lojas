'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Printer, Search, RefreshCw, Download, Settings, Scale as ScaleIcon, Usb, Bluetooth, Wifi, CheckCircle2, AlertTriangle, TestTube } from 'lucide-react';
import { printerApi, scaleApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';

export default function DevicesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dispositivos</h1>
          <p className="text-muted-foreground">Gerencie suas impressoras térmicas e balanças</p>
        </div>
      </div>
      <Tabs defaultValue="printers">
        <TabsList>
          <TabsTrigger value="printers" className="flex gap-2"><Printer className="h-4 w-4" />Impressoras</TabsTrigger>
          <TabsTrigger value="scales" className="flex gap-2"><ScaleIcon className="h-4 w-4" />Balanças</TabsTrigger>
        </TabsList>
        <TabsContent value="printers">
          <PrintersTab />
        </TabsContent>
        <TabsContent value="scales">
          <ScalesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PrintersTab() {
  const [systemPrinters, setSystemPrinters] = useState<any[]>([]);
  const [dbPrinters, setDBPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [checkingDrivers, setCheckingDrivers] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPrinter, setNewPrinter] = useState<any>({
    name: '',
    type: 'thermal',
    connection: 'usb',
    port: '',
    isDefault: false,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [sys, db] = await Promise.all([printerApi.available(), printerApi.list()]);
        setSystemPrinters(sys.data || []);
        setDBPrinters(db.data || []);
      } catch (e) {
        handleApiError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDiscover = async () => {
    try {
      setDiscovering(true);
      await printerApi.discover();
      await refresh();
      toast.success('Descoberta de impressoras concluída');
    } catch (e) {
      handleApiError(e);
    } finally {
      setDiscovering(false);
    }
  };

  const refresh = async () => {
    const [sys, db] = await Promise.all([printerApi.available(), printerApi.list()]);
    setSystemPrinters(sys.data || []);
    setDBPrinters(db.data || []);
  };

  const handleCheckDrivers = async () => {
    try {
      setCheckingDrivers(true);
      const res = await printerApi.checkDrivers();
      setDrivers(res.data || []);
    } catch (e) {
      handleApiError(e);
    } finally {
      setCheckingDrivers(false);
    }
  };

  const openAddDialog = (prefill?: any) => {
    const initial = {
      name: prefill?.name || '',
      type: 'thermal',
      connection: prefill?.connection || 'usb',
      port: prefill?.port || '',
      isDefault: false,
    };
    setNewPrinter(initial);
    setAddDialogOpen(true);
  };

  const handleCreatePrinter = async () => {
    try {
      if (!newPrinter.name) {
        toast.error('Informe um nome para a impressora');
        return;
      }
      if (!newPrinter.connection) {
        toast.error('Selecione o tipo de conexão');
        return;
      }
      if (newPrinter.connection !== 'usb' && !newPrinter.port) {
        toast.error('Informe a porta/IP para esta conexão');
        return;
      }
      setAdding(true);
      await printerApi.create({
        name: newPrinter.name,
        type: newPrinter.type,
        connection: newPrinter.connection,
        port: newPrinter.port || undefined,
        isDefault: !!newPrinter.isDefault,
      });
      toast.success('Impressora adicionada');
      setAddDialogOpen(false);
      await refresh();
    } catch (e) {
      handleApiError(e);
    } finally {
      setAdding(false);
    }
  };

  const handleDeletePrinter = async (id: string) => {
    try {
      setDeletingId(id);
      await printerApi.delete(id);
      toast.success('Impressora removida');
      await refresh();
    } catch (e) {
      handleApiError(e);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>
    );
  }

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'usb': return <Usb className="h-4 w-4" />;
      case 'network': return <Wifi className="h-4 w-4" />;
      case 'bluetooth': return <Bluetooth className="h-4 w-4" />;
      default: return <Printer className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleDiscover} variant="outline" disabled={discovering}>
          {discovering ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />} Descobrir
        </Button>
        <Button onClick={handleCheckDrivers} variant="outline" disabled={checkingDrivers}>
          {checkingDrivers ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />} Drivers
        </Button>
        <Button onClick={() => openAddDialog()}>
          Adicionar Impressora
        </Button>
      </div>
      {drivers.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Drivers</CardTitle><CardDescription>Estado dos drivers de impressoras</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {drivers.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${d.installed ? 'text-green-600' : 'text-muted-foreground'}`} /> {d.name}</div>
                <Badge variant={d.installed ? 'default' : 'secondary'}>{d.installed ? 'Instalado' : 'Não encontrado'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Sistema</CardTitle><CardDescription>Detectadas no sistema</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {systemPrinters.length === 0 && <Alert><AlertDescription>Nenhuma impressora detectada.</AlertDescription></Alert>}
            {systemPrinters.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">{getConnectionIcon(p.connection)} <span>{p.name}</span></div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === 'online' ? 'default' : 'secondary'}>{p.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => openAddDialog(p)}>
                    Adicionar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Configuradas</CardTitle><CardDescription>No banco de dados</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {dbPrinters.length === 0 && <Alert><AlertDescription>Nenhuma impressora cadastrada.</AlertDescription></Alert>}
            {dbPrinters.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Printer className="h-4 w-4" /> <span>{p.name}</span></div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.isConnected ? 'default' : 'secondary'}>{p.isConnected ? 'Conectada' : 'Desconectada'}</Badge>
                  <Button size="sm" variant="outline" onClick={async () => {
                    try { await printerApi.test(p.id); toast.success('Teste enviado'); } catch (e) { handleApiError(e); }
                  }}>
                    <TestTube className="h-4 w-4 mr-2" /> Testar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeletePrinter(p.id)} disabled={deletingId === p.id}>
                    {deletingId === p.id ? 'Removendo...' : 'Remover'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Impressora</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1">
              <Label htmlFor="printer-name">Nome</Label>
              <Input id="printer-name" value={newPrinter.name} onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={newPrinter.type} onValueChange={(v) => setNewPrinter({ ...newPrinter, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Térmica</SelectItem>
                  <SelectItem value="escpos">ESC/POS</SelectItem>
                  <SelectItem value="generic">Genérica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Conexão</Label>
                <Select value={newPrinter.connection} onValueChange={(v) => setNewPrinter({ ...newPrinter, connection: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usb">USB</SelectItem>
                    <SelectItem value="network">Rede (IP)</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{newPrinter.connection === 'network' ? 'Endereço IP:porta' : newPrinter.connection === 'bluetooth' ? 'Endereço Bluetooth' : 'Porta (opcional)'}</Label>
                <Input value={newPrinter.port} onChange={(e) => setNewPrinter({ ...newPrinter, port: e.target.value })} placeholder={newPrinter.connection === 'network' ? '192.168.0.100:9100' : newPrinter.connection === 'bluetooth' ? 'MAC ex: 00:11:22:33:44:55' : 'Ex: USB, LPT1'} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Definir como padrão</Label>
                <p className="text-xs text-muted-foreground">Usada por padrão nas impressões</p>
              </div>
              <Switch checked={newPrinter.isDefault} onCheckedChange={(v) => setNewPrinter({ ...newPrinter, isDefault: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePrinter} disabled={adding}>
              {adding ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScalesTab() {
  const [systemScales, setSystemScales] = useState<any[]>([]);
  const [dbScales, setDBScales] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [sys, db, drv] = await Promise.all([
          scaleApi.available(),
          scaleApi.list(),
          scaleApi.checkDrivers(),
        ]);
        setSystemScales(sys.data || []);
        setDBScales(db.data || []);
        setDrivers(drv.data || []);
      } catch (e) {
        handleApiError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    const [sys, db] = await Promise.all([scaleApi.available(), scaleApi.list()]);
    setSystemScales(sys.data || []);
    setDBScales(db.data || []);
  };

  const handleDiscover = async () => {
    try {
      setDiscovering(true);
      await scaleApi.discover();
      await refresh();
      toast.success('Descoberta de balanças concluída');
    } catch (e) { handleApiError(e); } finally { setDiscovering(false); }
  };

  const handleInstallDrivers = async () => {
    try {
      setInstalling(true);
      const res = await scaleApi.installDrivers();
      const msg = res.data?.message || 'Processo de drivers finalizado';
      toast.success(msg);
    } catch (e) { handleApiError(e); } finally { setInstalling(false); }
  };

  const addScale = async (dev: any) => {
    try {
      await scaleApi.create({ name: dev.name || dev.modelHint || 'Balança', connectionInfo: dev.port || dev.name });
      await refresh();
      toast.success('Balança adicionada');
    } catch (e) { handleApiError(e); }
  };

  const testScale = async (id: string) => {
    try {
      const res = await scaleApi.test(id);
      if (res.data?.success) {
        toast.success(`Peso: ${res.data.weight ?? '—'}`);
      } else {
        toast.error(res.data?.error || 'Falha no teste');
      }
    } catch (e) { handleApiError(e); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[200px]"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const getConnIcon = (c: string) => c === 'bluetooth' ? <Bluetooth className="h-4 w-4" /> : c === 'usb' ? <Usb className="h-4 w-4" /> : <ScaleIcon className="h-4 w-4" />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleDiscover} variant="outline" disabled={discovering}>
          {discovering ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />} Descobrir
        </Button>
        <Button onClick={handleInstallDrivers} variant="outline" disabled={installing}>
          {installing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />} Instalar Drivers
        </Button>
      </div>
      {drivers?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Drivers</CardTitle><CardDescription>Estado dos drivers de balança</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {drivers.map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${d.installed ? 'text-green-600' : 'text-muted-foreground'}`} /> {d.name}</div>
                <Badge variant={d.installed ? 'default' : 'secondary'}>{d.installed ? 'OK' : 'Faltando'}</Badge>
              </div>
            ))}
            <Alert className="mt-2"><AlertDescription>Se sua balança usa USB-Serial, conecte-a e verifique se surge uma porta COM no Windows.</AlertDescription></Alert>
          </CardContent>
        </Card>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Sistema</CardTitle><CardDescription>Detectadas no sistema</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {systemScales.length === 0 && <Alert><AlertDescription>Nenhuma balança detectada.</AlertDescription></Alert>}
            {systemScales.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">{getConnIcon(s.connection)} <span>{s.name}</span> <Badge variant="secondary">{s.port || s.connection}</Badge></div>
                <Button size="sm" variant="outline" onClick={() => addScale(s)}>
                  <Download className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Configuradas</CardTitle><CardDescription>No banco de dados</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {dbScales.length === 0 && <Alert><AlertDescription>Nenhuma balança cadastrada.</AlertDescription></Alert>}
            {dbScales.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><ScaleIcon className="h-4 w-4" /> <span>{s.name}</span> <Badge variant="secondary">{s.connectionInfo}</Badge></div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.isConnected ? 'default' : 'secondary'}>{s.isConnected ? 'Conectada' : 'Desconectada'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => testScale(s.id)}>
                    <TestTube className="h-4 w-4 mr-2" /> Testar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Alert>
        <AlertDescription>
          Para máxima compatibilidade, suportamos leitura por Porta Serial (COM/tty) e HID, com parsing para protocolos comuns (Toledo, Filizola, Urano, Elgin, Prix).
        </AlertDescription>
      </Alert>
    </div>
  );
}


