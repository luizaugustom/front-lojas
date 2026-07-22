import { getVisibleNavigation } from './sidebar-navigation';

describe('getVisibleNavigation', () => {
  it('exibe Ponto Eletrônico no menu web para empresa', () => {
    const items = getVisibleNavigation(
      { role: 'empresa', nfeEmissionEnabled: false },
      false,
    );

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Ponto Eletrônico', href: '/time-clock' }),
      ]),
    );
  });

  it('mantém Estabelecimentos oculto', () => {
    const items = getVisibleNavigation(
      { role: 'empresa', nfeEmissionEnabled: false },
      false,
    );

    expect(items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Estabelecimentos' })]),
    );
  });
});
