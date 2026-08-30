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

// Configuração padrão do cupom NFC-e renderizado em HTML (preview e impressoras USB/GDI).
// O cupom é gerado em texto puro com centerText(width=48) — 48 cols centradas por linha
// (casando com o buffer ESC/POS em printer.service.ts que usa NFC_LINE_WIDTH = 48).
// Em Courier New (ratio ≈ 0.6), 10px × 48 chars ≈ 76.2mm; ocupa toda a largura do papel
// 80mm (margens 0mm). 10px é o limite para 48 chars caberem em 80mm — 11px estoura
// (11 × 0.6 × 48 = 316.8px = 83.8mm). Layout ultra-compacto vertical: line-height 0.85, QR 120px.
const NFCE_HTML_RENDER = {
  pageSize: '80mm auto',
  bodyPadding: '0mm',
  bodyWidth: '80mm',
  bodyFontSize: '10px',
  bodyLineHeight: 0.85,
  qrImgPx: 120,
  qrWrapMargin: '2px 0',
} as const;

/**
 * Converte marcadores de QR/ESC-POS do cupom NFC-e em HTML imprimível no browser.
 * Desktop (Electron) interpreta os marcadores nativamente; na web geramos PNG do QR.
 */
async function enrichContentForWeb(content: string): Promise<string> {
  const markerRegex = new RegExp(PRINT_MARKER_REGEX.source, 'g');
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // O cupom vem do server com leading spaces (do centerText) para a térmica ESC/POS.
  // No HTML a centralização vem do CSS (text-align + margin auto no .content > *) — os
  // espaços à esquerda e direita precisam ser removidos para que cada linha shrink-wrap
  // ao seu conteúdo real e fique centralizada. Linhas vazias ficam vazias.
  const normalizeText = (text: string) =>
    text
      .split('\n')
      .map((line) => line.replace(/^\s+|\s+$/g, ''))
      .join('\n');

  while ((match = markerRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(normalizeText(content.substring(lastIndex, match.index))));
    }

    const qrUrl = match[2]?.trim();
    if (qrUrl) {
      try {
        const dataUrl = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: NFCE_HTML_RENDER.qrImgPx,
          type: 'image/png',
        });
        parts.push(
          `<div style="text-align:center;margin:${NFCE_HTML_RENDER.qrWrapMargin};width:100%;"><img src="${dataUrl}" alt="QR Code NFC-e" width="${NFCE_HTML_RENDER.qrImgPx}" height="${NFCE_HTML_RENDER.qrImgPx}" style="display:block;margin:0 auto;image-rendering:pixelated;" /></div>`,
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
    parts.push(escapeHtml(normalizeText(content.substring(lastIndex))));
  }

  return parts.join('');
}

function escapeHtml(text: string): string {
  // Não convertemos espaços em &nbsp; nem \n em <br/>: white-space: pre-wrap na
  // .content (CSS) preserva múltiplos espaços (necessário para alinhamento
  // centralizado) e permite quebra em word-boundary quando a linha excede a largura
  // — essencial para 48 cols em fontes monospace com metric ligeiramente maior
  // que Courier New.
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
            size: ${NFCE_HTML_RENDER.pageSize};
            margin: 0;
          }
          body {
            margin: 0;
            padding: ${NFCE_HTML_RENDER.bodyPadding};
            font-family: 'Courier New', monospace;
            font-size: ${NFCE_HTML_RENDER.bodyFontSize};
            line-height: ${NFCE_HTML_RENDER.bodyLineHeight};
            width: ${NFCE_HTML_RENDER.bodyWidth};
          }
        }
        body {
          margin: 0;
          padding: ${NFCE_HTML_RENDER.bodyPadding};
          font-family: 'Courier New', monospace;
          font-size: ${NFCE_HTML_RENDER.bodyFontSize};
          line-height: ${NFCE_HTML_RENDER.bodyLineHeight};
          width: ${NFCE_HTML_RENDER.bodyWidth};
          background: white;
        }
        .content {
          white-space: pre-wrap;
          word-wrap: break-word;
          text-align: center;
        }
        .content > * {
          margin: 0 auto;
          text-align: center;
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
