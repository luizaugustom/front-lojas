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
import { Printer, Search, RefreshCw, Download, Settings, Scale as ScaleIcon, Usb, Bluetooth, Wifi, CheckCircle2, AlertTriangle, TestTube, HelpCircle } from 'lucide-react';
import { scaleApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';
import { PageHelpModal } from '@/components/help';
import { devicesHelpTitle, devicesHelpDescription, devicesHelpIcon, getDevicesHelpTabs } from '@/components/help/contents/devices-help';

export default function DevicesPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dispositivos</h1>
          <p className="text-muted-foreground">Gerencie suas balanças</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setHelpOpen(true)} aria-label="Ajuda" className="shrink-0 hover:scale-105 transition-transform">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
      <Tabs defaultValue="scales">
        <TabsList>
          <TabsTrigger value="scales" className="flex gap-2"><ScaleIcon className="h-4 w-4" />Balanças</TabsTrigger>
        </TabsList>
        <TabsContent value="scales">
          <ScalesTab />
        </TabsContent>
      </Tabs>
      <PageHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} title={devicesHelpTitle} description={devicesHelpDescription} icon={devicesHelpIcon} tabs={getDevicesHelpTabs()} />
    </div>
  );
}

// Função PrintersTab removida - configuração de impressoras removida do sistema

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


