# Mobile Punch Flow — QR Modal + Auto-register

**Date:** 2026-08-13  
**Scope:** `front-lojas` only (web mobile). Sem mudanças em `lojas-desktop` ou API.  
**Status:** Approved for planning

## Problem

Na página de ponto no mobile, o fluxo de QR fica secundário (scanner inline / segundo clique). O vendedor precisa de um CTA claro **Bater ponto**, com QR só quando a empresa exige, em modal, e registro automático após a leitura.

## Goals

- No mobile, o card de bater ponto é a primeira seção útil da aba “Bater Ponto”.
- Um toque em **Bater ponto**:
  - sem QR exigido → registra com localização (se exigida);
  - com QR exigido → abre modal do leitor.
- Após ler o QR com sucesso → fecha modal e **registra automaticamente** (sem segundo clique).
- Câmera no modal **autoinicia**; em falha, botão **Tentar novamente**.

## Non-goals

- Alterar `lojas-desktop`.
- Alterar endpoints ou regras de negócio da API.
- Redesign completo da página de ponto (histórico, gestão, etc.).
- Fluxo específico novo para empresa/admin/gestor (herdam o card se usarem a mesma UI).

## User flow

1. Vendedor abre a aba **Bater Ponto**.
2. **Mobile (`useIsMobile`):** ordem = `PunchClockCard` → jornada (`VendorScheduleCard`) → GPS → histórico.
3. Toque em **Bater ponto**:
   - Se `requireLocation` e sem coords → pede GPS; **não** abre QR.
   - Se GPS ok (ou não exige) e `requireQrCode === false` → `register` imediato.
   - Se `requireQrCode === true` → abre `Dialog` com `QrScanner`.
4. Modal: câmera autoinicia; erro → mensagem + retry; cancelar → para câmera e fecha sem registrar.
5. QR ok → fecha modal → `register` com `qrToken` (+ lat/lng se exigido).
6. Feedback (sucesso / pendente / erro) permanece no alerta do `PunchClockCard`.

Desktop (≥ md): mesma lógica de botão/modal/auto-punch; ordem das seções pode permanecer a atual.

## Components

### `time-clock/page.tsx`

- Reordenar seções no mobile.
- Controlar `scannerOpen` via `Dialog` (não renderizar scanner inline solto).
- Em `onScan`: fechar modal e chamar `onQrScanned(token)` do `PunchClockCard` para registro automático.

### `PunchClockCard`

- Continua dono de `handlePunch`.
- `needsQr && !token` → apenas `onRequireQrScan()`.
- Aceitar prop `onReady?(api: { punchWithToken: (token: string) => void })` **ou** ref com `punchWithToken` — preferência: **callback `onReady`/`punchWithToken` estável** (sem imperative handle, a menos que o wiring do pai fique confuso).
- Guard de double-submit enquanto `register.isPending`.

### `QrScanner`

- Nova prop `autoStart?: boolean` (default `false`).
- Com `autoStart`, inicia câmera no mount; em erro, UI com **Tentar novamente**.
- `onClose` para o modal.

## Error handling

| Situação | Comportamento |
|----------|----------------|
| GPS negado/ausente | Alerta no card + CTA de permissão; modal QR não abre |
| Câmera negada/indisponível | Modal aberto com erro + retry |
| QR/API inválidos | Fecha modal; alerta de erro no card |
| Jornada completa | Sem botão ativo / UI de completa |
| Fechar modal no meio | Para câmera; não registra |

## Testing

- Unitário da decisão de fluxo (GPS → QR → register), no estilo de `next-expected-punch-state`.
- Manual: QR on/off, GPS ok/negado, câmera ok/negada, double-tap no botão.

## Success criteria

- Mobile: primeiro bloco útil é o CTA de bater ponto.
- Sem QR: um toque registra (quando GPS ok/não exigido).
- Com QR: modal autoinicia câmera; leitura dispara registro automático.
- Sem regressão no desktop além do modal + auto-punch compartilhados.
