/**
 * Extrai a chave de acesso NF-e/NFC-e (44 dígitos) a partir de texto digitado,
 * código de barras (Code 128) ou QR Code / URL de consulta.
 *
 * Leitores USB costumam prefixar AIM (ex.: "]C1"), e o QR da DANFE devolve URL
 * com chNFe / p= — ambos deixam de ter exatamente 44 dígitos após strip simples.
 */
export function extractNfeAccessKey(raw: string): string | null {
  if (!raw?.trim()) return null;

  const trimmed = raw.trim();

  const fromQuery =
    trimmed.match(/[?&#/](?:chNFe|nfe)=(\d{44})/i) ||
    trimmed.match(/[?&#/]p=(\d{44})/i) ||
    trimmed.match(/(?:chNFe|nfe)[=:](\d{44})/i);
  if (fromQuery?.[1]) return fromQuery[1];

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 44) return digits;

  if (digits.length > 44) {
    for (let i = 0; i <= digits.length - 44; i++) {
      const candidate = digits.slice(i, i + 44);
      if (isNfeModel(candidate)) return candidate;
    }
    // Prefixo de leitor ou dígitos extras sem modelo reconhecível: mesmos 44 finais do input.
    return digits.slice(-44);
  }

  return null;
}

function isNfeModel(key44: string): boolean {
  const model = key44.slice(20, 22);
  return model === '55' || model === '65';
}
