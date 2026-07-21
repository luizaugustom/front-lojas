/**
 * Extrai / normaliza chave de acesso NF-e/NFC-e (44 dígitos).
 *
 * Aceita:
 * - 44 dígitos (chave completa)
 * - QR/URL (chNFe=, p=) e prefixos de leitor (AIM ]C1)
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
  return normalizeNfeAccessKeyDigits(digits);
}

/** Normaliza sequência só com dígitos para chave de 44 posições (quando possível sem ambiguidade). */
export function normalizeNfeAccessKeyDigits(digits: string): string | null {
  if (!digits) return null;

  if (digits.length === 44) {
    return digits;
  }

  if (digits.length > 44) {
    for (let i = 0; i <= digits.length - 44; i++) {
      const candidate = digits.slice(i, i + 44);
      if (isNfeModel(candidate)) return candidate;
    }
    return digits.slice(-44);
  }

  return null;
}

/** Retorna somente a chave completa lida, sem acrescentar ou alterar dígitos. */
export function expandNfeAccessKeyCandidates(raw: string): string[] {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 44) return [digits];
  return [];
}

/** DV módulo 11 da chave NF-e (manual SEFAZ: resto 0 ou 1 → DV 0). */
export function calcNfeAccessKeyDv(body43: string): number {
  let sum = 0;
  let weight = 2;
  for (let i = body43.length - 1; i >= 0; i--) {
    sum += Number(body43[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const resto = sum % 11;
  if (resto === 0 || resto === 1) return 0;
  return 11 - resto;
}

function isNfeModel(key44: string): boolean {
  const model = key44.slice(20, 22);
  return model === '55' || model === '65';
}
