import {
  resolvePunchAction,
  isFlagOn,
  punchStatusFromRegisterResult,
} from './punch-action';

describe('isFlagOn', () => {
  it('aceita true e equivalentes da API', () => {
    expect(isFlagOn(true)).toBe(true);
    expect(isFlagOn(1)).toBe(true);
    expect(isFlagOn('true')).toBe(true);
  });

  it('recusa false, 0 e ausente', () => {
    expect(isFlagOn(false)).toBe(false);
    expect(isFlagOn(0)).toBe(false);
    expect(isFlagOn(undefined)).toBe(false);
  });
});

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

  it('abre QR também quando a flag vem como 1 da API', () => {
    expect(
      resolvePunchAction({
        requireLocation: false,
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

describe('punchStatusFromRegisterResult', () => {
  it('lê status em timeClock (formato real da API)', () => {
    expect(
      punchStatusFromRegisterResult({
        timeClock: { status: 'PENDING_REVIEW' },
        nextExpected: 'LUNCH_OUT',
      }),
    ).toBe('PENDING_REVIEW');
  });

  it('aceita status no nível raiz como fallback', () => {
    expect(punchStatusFromRegisterResult({ status: 'VALID' })).toBe('VALID');
  });

  it('retorna undefined quando não há status', () => {
    expect(punchStatusFromRegisterResult({ nextExpected: null })).toBeUndefined();
  });
});
