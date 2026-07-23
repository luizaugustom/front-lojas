import { getVisibleNavigation } from './sidebar-navigation';

describe('getVisibleNavigation', () => {
  it('exibe Ponto Eletrônico no menu web para empresa', () => {
    const items = getVisibleNavigation({ role: 'empresa', nfeEmissionEnabled: false });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Ponto Eletrônico', href: '/time-clock' }),
      ]),
    );
  });

  it('exibe Boletos no menu para empresa', () => {
    const items = getVisibleNavigation({ role: 'empresa', nfeEmissionEnabled: false });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Boletos', href: '/boletos' }),
      ]),
    );
  });

  it('não exibe Boletos no menu para vendedor', () => {
    const items = getVisibleNavigation({ role: 'vendedor', nfeEmissionEnabled: false });

    expect(items).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Boletos', href: '/boletos' }),
      ]),
    );
  });

  it('mantém Estabelecimentos oculto', () => {
    const items = getVisibleNavigation({ role: 'empresa', nfeEmissionEnabled: false });

    expect(items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Estabelecimentos' })]),
    );
  });
});
