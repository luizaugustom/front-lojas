/**
 * Extrai / normaliza chave de acesso NF-e/NFC-e (44 dígitos).
 *
 * Aceita:
 * - 44 dígitos (chave completa)
 * - QR/URL (chNFe=, p=) e prefixos de leitor (AIM ]C1)
 */

const UF_IBGE_CODES = new Set([
  '11', '12', '13', '14', '15', '16', '17', '21', '22', '23', '24', '25', '26', '27', '28',
  '29', '31', '32', '33', '35', '41', '42', '43', '50', '51', '52', '53',
]);

export function extractNfeAccessKey(raw: string): string | null {
  if (!raw?.trim()) return null;

  const trimmed = raw.trim();

  const fromQuery =
    trimmed.match(/[?&#/](?:chNFe|nfe)=(\d{44})/i) ||
    trimmed.match(/[?&#/]p=(\d{44})/i) ||
    trimmed.match(/(?:chNFe|nfe)[=:](\d{44})/i);
  if (fromQuery?.[1]) return isValidNfeAccessKey(fromQuery[1]) ? fromQuery[1] : null;

  const digits = trimmed.replace(/\D/g, '');
  return normalizeNfeAccessKeyDigits(digits);
}

/** Normaliza sequência só com dígitos para chave de 44 posições (quando possível sem ambiguidade). */
export function normalizeNfeAccessKeyDigits(digits: string): string | null {
  if (!digits) return null;

  if (digits.length === 44) {
    return isValidNfeAccessKey(digits) ? digits : null;
  }

  if (digits.length > 44) {
    for (let i = 0; i <= digits.length - 44; i++) {
      const candidate = digits.slice(i, i + 44);
      if (isValidNfeAccessKey(candidate)) return candidate;
    }
    return null;
  }

  return null;
}

/** Retorna somente a chave completa lida, sem acrescentar ou alterar dígitos. */
export function expandNfeAccessKeyCandidates(raw: string): string[] {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 44 && isValidNfeAccessKey(digits)) return [digits];
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

function isValidNfeAccessKey(key44: string): boolean {
  if (!/^\d{44}$/.test(key44) || !UF_IBGE_CODES.has(key44.slice(0, 2))) {
    return false;
  }

  const year = Number(key44.slice(2, 4));
  const month = Number(key44.slice(4, 6));
  const currentYear = new Date().getFullYear() % 100;
  if (year < 6 || year > currentYear || month < 1 || month > 12) return false;

  const model = key44.slice(20, 22);
  if (model !== '55' && model !== '65') return false;

  return calcNfeAccessKeyDv(key44.slice(0, 43)) === Number(key44[43]);
}
