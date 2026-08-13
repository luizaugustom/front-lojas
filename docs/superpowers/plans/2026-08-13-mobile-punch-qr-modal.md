# Mobile Punch QR Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No mobile do front-lojas, CTA de bater ponto primeiro; QR em modal com auto-câmera e registro automático após leitura.

**Architecture:** Extrair decisão de fluxo (`resolvePunchAction`) testável; `PunchClockCard` expõe `punchWithToken` via `onReady`; página usa `Dialog` + `QrScanner(autoStart)` e reordena seções no mobile.

**Tech Stack:** Next.js (front-lojas), React, Dialog (Radix), Html5Qrcode, Jest, `useIsMobile`.

**Spec:** `docs/superpowers/specs/2026-08-13-mobile-punch-qr-modal-design.md`

---

### Task 1: Decisão de fluxo (TDD)

**Files:**
- Create: `src/components/time-clock/punch-action.ts`
- Create: `src/components/time-clock/punch-action.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { resolvePunchAction } from './punch-action';

describe('resolvePunchAction', () => {
  it('pede GPS quando exige localização e não há coords', () => {
    expect(
      resolvePunchAction({
        requireLocation: true,
        requireQrCode: true,
        hasLocation: false,
        hasQrToken: false,
      }),
    ).toEqual({ kind: 'need_location' });
  });

  it('abre QR quando GPS ok e exige QR sem token', () => {
    expect(
      resolvePunchAction({
        requireLocation: true,
        requireQrCode: true,
        hasLocation: true,
        hasQrToken: false,
      }),
    ).toEqual({ kind: 'need_qr' });
  });

  it('registra quando não exige QR e GPS ok', () => {
    expect(
      resolvePunchAction({
        requireLocation: true,
        requireQrCode: false,
        hasLocation: true,
        hasQrToken: false,
      }),
    ).toEqual({ kind: 'register' });
  });

  it('registra quando tem token QR', () => {
    expect(
      resolvePunchAction({
        requireLocation: false,
        requireQrCode: true,
        hasLocation: false,
        hasQrToken: true,
      }),
    ).toEqual({ kind: 'register' });
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- --testPathPattern=punch-action --no-coverage`

- [ ] **Step 3: Implement**

```ts
export type PunchAction =
  | { kind: 'need_location' }
  | { kind: 'need_qr' }
  | { kind: 'register' };

export function resolvePunchAction(opts: {
  requireLocation: boolean;
  requireQrCode: boolean;
  hasLocation: boolean;
  hasQrToken: boolean;
}): PunchAction {
  if (opts.requireLocation && !opts.hasLocation) return { kind: 'need_location' };
  if (opts.requireQrCode && !opts.hasQrToken) return { kind: 'need_qr' };
  return { kind: 'register' };
}
```

- [ ] **Step 4: Run tests — expect PASS**

---

### Task 2: QrScanner autoStart

**Files:**
- Modify: `src/components/time-clock/QrScanner.tsx`

- [ ] Add prop `autoStart?: boolean` (default false)
- [ ] `useEffect` on mount: if `autoStart`, call `start()`
- [ ] Keep retry button on error (reuse existing "Iniciar câmera" as "Tentar novamente" when error)

---

### Task 3: PunchClockCard + onReady

**Files:**
- Modify: `src/components/time-clock/PunchClockCard.tsx`

- [ ] Use `resolvePunchAction` inside `handlePunch`
- [ ] Add `onReady?: (api: { punchWithToken: (token: string) => void }) => void`
- [ ] `useEffect` to pass stable `punchWithToken` that calls `handlePunch(token)`
- [ ] Disable button while `register.isPending`

---

### Task 4: Page — modal + mobile order

**Files:**
- Modify: `src/app/(dashboard)/time-clock/page.tsx`

- [ ] `useIsMobile()`; vendedor mobile: PunchClockCard primeiro
- [ ] Wrap QrScanner in Dialog; `autoStart`
- [ ] onScan: close dialog, call `punchWithToken` from ref/state set by `onReady`
- [ ] Apply same Dialog/auto-punch to branch empresa (shared card)

---

### Task 5: Verify

- [ ] `npm test -- --testPathPattern=punch-action --no-coverage`
- [ ] Lint touched files
