/**
 * Serviço de impressão universal que funciona tanto no desktop (Electron) quanto na web
 */

import QRCode from 'qrcode';

declare global {
  interface Window {
    electronAPI?: {
      printers?: {
        list: () => Promise<any>;
        getDefault: () => Promise<any>;
        print: (printerName: string | null, content: string) => Promise<any>;
        test: (printerName: string | null) => Promise<any>;
      };
    };
  }
}

/**
 * Detecta se está rodando no Electron (desktop)
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}

const PRINT_MARKER_REGEX = /<<(?:ESC_POS_BINARY:([A-Za-z0-9+/=]+)|NFC_E_QR:([^>\n]+))>>/g;

/**
 * Converte marcadores de QR/ESC-POS do cupom NFC-e em HTML imprimível no browser.
 * Desktop (Electron) interpreta os marcadores nativamente; na web geramos PNG do QR.
 */
async function enrichContentForWeb(content: string): Promise<string> {
  const markerRegex = new RegExp(PRINT_MARKER_REGEX.source, 'g');
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = markerRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(content.substring(lastIndex, match.index)));
    }

    const qrUrl = match[2]?.trim();
    if (qrUrl) {
      try {
        const dataUrl = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 80,
          type: 'image/png',
        });
        parts.push(
          `<div style="text-align:center;margin:6px 0;"><img src="${dataUrl}" alt="QR Code NFC-e" width="80" height="80" style="image-rendering:pixelated;" /></div>`,
        );
      } catch (error) {
        console.warn('Falha ao gerar QR Code para impressão web:', error);
        parts.push(escapeHtml(qrUrl));
      }
    }
    // ESC_POS_BINARY: sem decodificador no browser — omitir (QR deve vir como NFC_E_QR)

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(escapeHtml(content.substring(lastIndex)));
  }

  return parts.join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/ /g, '&nbsp;')
    .replace(/\n/g, '<br/>');
}

/**
 * Formata conteúdo de texto para impressão HTML (web)
 */
async function formatContentForWeb(content: string): Promise<string> {
  const bodyHtml = await enrichContentForWeb(content);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Impressão de Cupom</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 4mm;
            font-family: 'Courier New', monospace;
            font-size: 7px;
            line-height: 1.0;
            width: 72mm;
          }
        }
        body {
          margin: 0;
          padding: 4mm;
          font-family: 'Courier New', monospace;
          font-size: 7px;
          line-height: 1.0;
          width: 72mm;
          background: white;
        }
        .content {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <div class="content">${bodyHtml}</div>
    </body>
    </html>
  `;
}

/**
 * Imprime conteúdo no navegador usando window.print
 */
async function printInBrowser(content: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Criar janela de impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return { success: false, error: 'Não foi possível abrir janela de impressão. Verifique se os pop-ups estão bloqueados.' };
    }

    // Formatar conteúdo para HTML (inclui QR Code da NFC-e)
    const htmlContent = await formatContentForWeb(content);

    // Escrever conteúdo na janela
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Fechar janela após impressão
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 250);
    };

    // Se já carregou, imprimir imediatamente
    if (printWindow.document.readyState === 'complete') {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 250);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao imprimir no navegador:', error);
    return { success: false, error: error.message || 'Erro ao imprimir' };
  }
}

/**
 * Imprime conteúdo usando Electron (desktop)
 */
async function printInElectron(printerName: string | null, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!window.electronAPI?.printers) {
      return { success: false, error: 'API de impressão não disponível' };
    }

    const result = await window.electronAPI.printers.print(printerName, content);
    return result;
  } catch (error: any) {
    console.error('Erro ao imprimir no Electron:', error);
    return { success: false, error: error.message || 'Erro ao imprimir' };
  }
}

/**
 * Função principal de impressão
 * Funciona tanto no desktop quanto na web
 */
export async function printContent(
  content: string,
  printerName?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isElectron()) {
      // Desktop: usar Electron
      return await printInElectron(printerName || null, content);
    } else {
      // Web: usar window.print
      return await printInBrowser(content);
    }
  } catch (error: any) {
    console.error('Erro na impressão:', error);
    return { success: false, error: error.message || 'Erro desconhecido na impressão' };
  }
}

/**
 * Lista impressoras disponíveis (apenas desktop)
 */
export async function listPrinters(): Promise<{ success: boolean; printers?: any[]; error?: string }> {
  if (!isElectron() || !window.electronAPI?.printers) {
    return { success: false, printers: [], error: 'Não disponível na web' };
  }

  try {
    return await window.electronAPI.printers.list();
  } catch (error: any) {
    return { success: false, printers: [], error: error.message };
  }
}

/**
 * Obtém impressora padrão (apenas desktop)
 */
export async function getDefaultPrinter(): Promise<{ success: boolean; printerName?: string | null; error?: string }> {
  if (!isElectron() || !window.electronAPI?.printers) {
    return { success: false, printerName: null, error: 'Não disponível na web' };
  }

  try {
    return await window.electronAPI.printers.getDefault();
  } catch (error: any) {
    return { success: false, printerName: null, error: error.message };
  }
}

/**
 * Testa impressora (apenas desktop)
 */
export async function testPrinter(printerName?: string | null): Promise<{ success: boolean; error?: string }> {
  if (!isElectron() || !window.electronAPI?.printers) {
    return { success: false, error: 'Não disponível na web' };
  }

  try {
    return await window.electronAPI.printers.test(printerName || null);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
