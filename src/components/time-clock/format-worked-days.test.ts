import { formatWorkedDays } from './format';

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
