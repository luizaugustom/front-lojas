/**
 * Tipos compartilhados pelos componentes fiscais do frontend.
 *
 * Mantém paridade com a API NestJS (api-lojas).
 * ATO DIAT Nº 38/2020 — SEFAZ-SC.
 */

// === DTEC (Art. 2º) ===

/**
 * Status do credenciamento DTEC.
 */
export interface DtecStatus {
  dtecCredentialed: boolean;
  dtecCredentialedAt?: string;
  dtecCredentialExpiresAt?: string;
  dtecCredentialProtocol?: string;
  isExpired: boolean;
  daysToExpire?: number | null;
  valid: boolean;
}

/**
 * Tipos de TTD conforme Art. 4º.
 */
export type TtdType = 'TTD_706' | 'TTD_707' | 'TTD_710';

// === Termo de Compromisso (Anexos I/II) ===

export type TermoType = 'TTD_706' | 'TTD_707' | 'TTD_710' | 'ALL';

export interface TermoCompromisso {
  id: string;
  type: TermoType;
  accepted: boolean;
  acceptedAt?: string;
  ipAddress?: string;
  documentHash?: string;
  pdfUrl?: string;
}

// === Wizard de Credenciamento Inicial (Art. 4º §1º) ===

export type CredentialingStep = 'dtec' | 'ttd' | 'termo';

export interface CredentialingStatus {
  dtecCredentialed: boolean;
  dtecCredentialedAt?: string;
  dtecCredentialExpiresAt?: string;
  dtecCredentialProtocol?: string;
  nfcContingencyType?: TtdType | string;
  ttdChangeAllowed?: boolean;
  termAccepted?: boolean;
}

// === Tipos helpers ===

export interface ContingencyMotivoTipificado {
  code: string;
  label: string;
}

/**
 * Lista canônica dos motivos de contingência tipificados (Art. 8º).
 * Usar em `select` em vez de campo de texto-livre.
 */
export const CONTINGENCY_MOTIVOS: ContingencyMotivoTipificado[] = [
  { code: 'SEFAZ_OFFLINE', label: 'SEFAZ indisponível (sem resposta da SEFAZ)' },
  { code: 'INTERNET_FAIL', label: 'Falha de internet / link de comunicação' },
  { code: 'CERTIFICATE_FAIL', label: 'Falha no certificado digital A1' },
  { code: 'FOCUS_NFE_TIMEOUT', label: 'Timeout do Focus NFe' },
  { code: 'FOCUS_NFE_ERROR', label: 'Erro genérico do Focus NFe' },
  { code: 'MAINTENANCE', label: 'Manutenção programada' },
  { code: 'OTHER', label: 'Outro (descrever)' },
];
