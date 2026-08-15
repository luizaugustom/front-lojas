export type PunchAction =
  | { kind: 'need_location' }
  | { kind: 'need_qr' }
  | { kind: 'register' };

export function isFlagOn(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

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

/** Status da marcação na resposta de POST /time-clock/register */
export function punchStatusFromRegisterResult(
  result: unknown,
): string | undefined {
  if (!result || typeof result !== 'object') return undefined;
  const r = result as Record<string, unknown>;
  const nested = r.timeClock;
  if (nested && typeof nested === 'object' && nested !== null) {
    const status = (nested as { status?: unknown }).status;
    if (typeof status === 'string') return status;
  }
  return typeof r.status === 'string' ? r.status : undefined;
}
