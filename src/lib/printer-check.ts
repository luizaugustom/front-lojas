import { api } from '@/lib/api';
import { useDeviceStore } from '@/store/device-store';

/**
 * Verifica o status das impressoras e atualiza o store
 * Esta função pode ser chamada:
 * - Ao fazer login
 * - Ao clicar em um botão manual de atualização
 */
export async function checkPrinterStatus() {
  const { setPrinterStatus, setPrinterName } = useDeviceStore.getState();
  
  try {
    setPrinterStatus('checking');
    
    // Buscar impressoras cadastradas
    const response = await api.get('/printer');
    const printers = response.data?.printers || response.data || [];
    
    // Encontrar impressora padrão
    const printer = printers.find((p: any) => p.isDefault) || printers[0];
    
    if (!printer) {
      setPrinterStatus('disconnected');
      setPrinterName(null);
      return {
        success: false,
        message: 'Nenhuma impressora cadastrada'
      };
    }

    setPrinterName(printer.name);

    // Verificar status da impressora
    try {
      const statusResponse = await api.get(`/printer/${printer.id}/status`);
      const status = statusResponse.data;
      
      if (status.connected || status.status === 'online' || status.status === 'ready') {
        setPrinterStatus('connected');
        return {
          success: true,
          message: `Impressora ${printer.name} conectada`,
          printer
        };
      } else {
        setPrinterStatus('error');
        return {
          success: false,
          message: `Impressora ${printer.name} com erro`,
          printer
        };
      }
    } catch (statusError) {
      setPrinterStatus('error');
      return {
        success: false,
        message: `Erro ao verificar status da impressora ${printer.name}`,
        printer
      };
    }
  } catch (error) {
    // Se não houver impressoras cadastradas
    setPrinterStatus('disconnected');
    setPrinterName(null);
    return {
      success: false,
      message: 'Erro ao buscar impressoras'
    };
  }
}

