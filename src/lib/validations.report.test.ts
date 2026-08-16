import { reportSchema } from './validations';

const baseReport = {
  format: 'excel' as const,
  startDate: '2026-08-01',
  endDate: '2026-08-16',
  sellerId: 'all',
};

describe('reportSchema', () => {
  it('aceita vendas com NF (sales_with_fiscal)', () => {
    const result = reportSchema.safeParse({
      ...baseReport,
      reportType: 'sales_with_fiscal',
    });

    expect(result.success).toBe(true);
  });

  it('aceita vendas sem NF (sales_without_fiscal)', () => {
    const result = reportSchema.safeParse({
      ...baseReport,
      reportType: 'sales_without_fiscal',
    });

    expect(result.success).toBe(true);
  });

  it('rejeita tipo de relatório desconhecido', () => {
    const result = reportSchema.safeParse({
      ...baseReport,
      reportType: 'unknown_report',
    });

    expect(result.success).toBe(false);
  });
});
