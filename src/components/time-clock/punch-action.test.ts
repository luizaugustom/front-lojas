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
