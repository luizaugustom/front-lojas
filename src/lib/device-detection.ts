/**
 * Utilitários para detectar e registrar dispositivos do computador do usuário
 */

const COMPUTER_ID_KEY = 'montshop_computer_id';

/**
 * Gera ou recupera um identificador único para o computador
 */
export function getComputerId(): string {
  let computerId = localStorage.getItem(COMPUTER_ID_KEY);
  
  if (!computerId) {
    // Gera um ID único baseado em informações do navegador
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText(
        `${navigator.userAgent}${navigator.language}${screen.width}x${screen.height}${new Date().getTimezoneOffset()}`,
        2,
        2
      );
    }
    
    // Combina com mais informações
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '',
      canvas.toDataURL().slice(-50), // últimos 50 caracteres do canvas
    ].join('|');
    
    // Gera hash simples (não precisa ser criptográfico, apenas único)
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    computerId = `comp_${Math.abs(hash).toString(36)}${Date.now().toString(36)}`;
    localStorage.setItem(COMPUTER_ID_KEY, computerId);
  }
  
  return computerId;
}

/**
 * Detecta impressoras usando a Web Serial API e outras APIs disponíveis
 */
export async function detectClientPrinters(): Promise<any[]> {
  const printers: any[] = [];

  try {
    // Tenta usar a Web Serial API (navegadores Chromium)
    if ('serial' in navigator) {
      try {
        // Web Serial API não lista portas diretamente, mas podemos tentar descobrir
        // Por enquanto, deixamos vazio pois requer interação do usuário
        console.log('[DeviceDetection] Web Serial API disponível, mas requer seleção manual de porta');
      } catch (error) {
        console.warn('[DeviceDetection] Erro ao acessar Web Serial API:', error);
      }
    }

    // Para impressoras, precisamos de uma abordagem diferente
    // No Windows, podemos tentar usar uma extensão ou agente local
    // Por enquanto, vamos tentar detectar usando chamadas para APIs nativas via fetch
    
    // Tentativa de detectar usando endpoint que executa no cliente
    // Isso requer que o cliente tenha permissões apropriadas
    console.log('[DeviceDetection] Detecção de impressoras requer agente local ou extensão');
    
  } catch (error) {
    console.error('[DeviceDetection] Erro ao detectar impressoras:', error);
  }

  return printers;
}

/**
 * Detecta portas seriais (balanças) usando Web Serial API
 */
export async function detectClientScales(): Promise<any[]> {
  const scales: any[] = [];

  try {
    // Web Serial API - disponível em navegadores Chromium
    if ('serial' in navigator) {
      try {
        // Solicita acesso às portas seriais
        // Nota: Isso requer interação do usuário (click, etc)
        const port = await (navigator as any).serial.requestPort();
        
        if (port) {
          scales.push({
            name: port.getInfo().usbVendorId 
              ? `Dispositivo Serial (Vendor: ${port.getInfo().usbVendorId})`
              : 'Porta Serial',
            port: `serial://${port.getInfo().usbVendorId || 'unknown'}`,
            connection: 'serial',
            vendor: port.getInfo().usbVendorId?.toString(),
          });
        }
      } catch (error: any) {
        // Erro esperado se usuário cancelar ou se não houver permissão
        if (error.name !== 'NotFoundError' && error.name !== 'SecurityError') {
          console.warn('[DeviceDetection] Erro ao acessar portas seriais:', error);
        }
      }
    } else {
      console.log('[DeviceDetection] Web Serial API não disponível neste navegador');
    }

    // Para detecção automática sem interação do usuário,
    // seria necessário um agente local ou extensão
    // Por enquanto, deixamos vazio e o usuário pode selecionar manualmente
    
  } catch (error) {
    console.error('[DeviceDetection] Erro ao detectar balanças:', error);
  }

  return scales;
}

/**
 * Tenta detectar dispositivos chamando APIs do sistema via fetch
 * Esta é uma abordagem que funciona se houver um serviço local rodando
 */
export async function detectDevicesViaLocalService(): Promise<{ printers: any[]; scales: any[] }> {
  const printers: any[] = [];
  const scales: any[] = [];

  try {
    // Tenta chamar um serviço local (se existir)
    // Exemplo: http://localhost:8080/detect-devices
    const localServiceUrl = 'http://localhost:8080/detect-devices';
    
    try {
      const response = await fetch(localServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' }),
        // Timeout curto para não travar
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.printers) printers.push(...data.printers);
        if (data.scales) scales.push(...data.scales);
      }
    } catch (error) {
      // Serviço local não disponível - isso é esperado
      console.log('[DeviceDetection] Serviço local não disponível (normal se não estiver rodando)');
    }
  } catch (error) {
    console.error('[DeviceDetection] Erro ao detectar via serviço local:', error);
  }

  return { printers, scales };
}

/**
 * Detecta dispositivos usando uma abordagem híbrida:
 * 1. Tenta Web Serial API (para balanças)
 * 2. Tenta serviço local (se disponível)
 * 3. Solicita informações ao usuário se necessário
 */
export async function detectAllDevices(): Promise<{ printers: any[]; scales: any[] }> {
  console.log('[DeviceDetection] Iniciando detecção de dispositivos...');
  
  const [localDevices, clientPrinters, clientScales] = await Promise.all([
    detectDevicesViaLocalService(),
    detectClientPrinters(),
    detectClientScales(),
  ]);

  // Combina resultados
  const printers = [...localDevices.printers, ...clientPrinters];
  const scales = [...localDevices.scales, ...clientScales];

  console.log(`[DeviceDetection] Detectados: ${printers.length} impressora(s), ${scales.length} balança(s)`);

  return { printers, scales };
}

/**
 * Solicita ao usuário que selecione uma porta serial (para balanças)
 */
export async function requestSerialPort(): Promise<any | null> {
  if (!('serial' in navigator)) {
    console.warn('[DeviceDetection] Web Serial API não disponível');
    return null;
  }

  try {
    const port = await (navigator as any).serial.requestPort();
    return {
      name: `Porta Serial Selecionada`,
      port: `serial://${port.getInfo().usbVendorId || 'unknown'}`,
      connection: 'serial',
      portInfo: port.getInfo(),
      portObject: port, // Mantém referência para uso posterior
    };
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      console.log('[DeviceDetection] Usuário cancelou seleção de porta');
    } else {
      console.error('[DeviceDetection] Erro ao solicitar porta serial:', error);
    }
    return null;
  }
}

