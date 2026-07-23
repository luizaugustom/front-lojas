import { getVisibleNavigation } from './sidebar-navigation';

describe('getVisibleNavigation', () => {
  it('exibe Ponto Eletrônico no menu web para empresa', () => {
    const items = getVisibleNavigation(
      { role: 'empresa', nfeEmissionEnabled: false },
      true,
    );

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Ponto Eletrônico', href: '/time-clock' }),
      ]),
    );
  });

  it('exibe Boletos no menu quando liberado (mesmo sem boletoEnabled)', () => {
    const items = getVisibleNavigation(
      { role: 'empresa', nfeEmissionEnabled: false },
      true,
    );

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Boletos', href: '/boletos' }),
      ]),
    );
  });

  it('oculta Boletos no menu quando não liberado pelo admin', () => {
    const items = getVisibleNavigation(
      { role: 'empresa', nfeEmissionEnabled: false },
      false,
    );

    expect(items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Boletos' })]),
    );
  });

  it('mantém Estabelecimentos oculto', () => {
    const items = getVisibleNavigation(
      { role: 'empresa', nfeEmissionEnabled: false },
      true,
    );

    expect(items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Estabelecimentos' })]),
    );
  });
});
