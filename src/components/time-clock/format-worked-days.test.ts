import { formatWorkedDays, isWithinRadius } from './format';

describe('formatWorkedDays', () => {
  it('usa workedDays/totalDays quando existem', () => {
    expect(
      formatWorkedDays({ workedDays: 12, totalDays: 22 }),
    ).toBe('12/22');
  });

  it('cai para completedDays + incompleteDays da API', () => {
    expect(
      formatWorkedDays({ completedDays: 8, incompleteDays: 3 }),
    ).toBe('8/11');
  });

  it('não mostra undefined quando os campos estão ausentes', () => {
    expect(formatWorkedDays({})).toBe('0/0');
    expect(formatWorkedDays(undefined)).toBe('0/0');
  });
});

describe('isWithinRadius', () => {
  it('aceita distância dentro do raio', () => {
    expect(isWithinRadius(80, 100, 0)).toBe(true);
    expect(isWithinRadius(101, 100, 0)).toBe(false);
  });

  it('usa a precisão do GPS como folga (até 75m)', () => {
    expect(isWithinRadius(120, 100, 40)).toBe(true);
    expect(isWithinRadius(200, 100, 200)).toBe(false);
  });
});
