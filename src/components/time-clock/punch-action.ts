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
