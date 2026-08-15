import { parseTimeClockListResponse } from './parse-time-clock-list';

describe('parseTimeClockListResponse', () => {
  it('lê items + total no formato da API', () => {
    const r = parseTimeClockListResponse({
      items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      total: 3,
      page: 1,
      limit: 20,
    });
    expect(r.items).toHaveLength(3);
    expect(r.total).toBe(3);
  });

  it('não confunde total com lista vazia (bug do campo data)', () => {
    const r = parseTimeClockListResponse({
      items: [{ id: '1' }],
      total: 1,
    });
    expect(r.items).toEqual([{ id: '1' }]);
    expect(r.total).toBe(1);
  });

  it('aceita array cru, { data } e { punches }', () => {
    expect(parseTimeClockListResponse([{ id: 'x' }]).items).toHaveLength(1);
    expect(parseTimeClockListResponse({ data: [{ id: 'y' }], total: 1 }).items).toHaveLength(1);
    expect(parseTimeClockListResponse({ punches: [{ id: 'z' }] }).items).toHaveLength(1);
  });

  it('retorna vazio quando não há marcações', () => {
    expect(parseTimeClockListResponse({ items: [], total: 0 })).toEqual({
      items: [],
      total: 0,
    });
    expect(parseTimeClockListResponse(undefined).total).toBe(0);
  });
});
