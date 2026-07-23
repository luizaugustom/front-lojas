import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaxasCartaoSettings } from './taxas-cartao-settings';

const mockList = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/api-endpoints', () => ({
  cardAcquirerRateApi: {
    list: () => mockList(),
    create: (data: unknown) => mockCreate(data),
    update: (id: string, data: unknown) => mockUpdate(id, data),
    delete: (id: string) => mockDelete(id),
  },
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/lib/acquirer-cnpj-list', () => ({
  getAcquirerList: () => [{ cnpj: '00000000000000', name: 'Cielo' }],
}));

jest.mock('@/components/ui/acquirer-cnpj-select', () => ({
  AcquirerCnpjSelect: (props: { value: string; onChange: (v: string) => void }) => (
    <input
      data-testid="acquirer-cnpj-select"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    />
  ),
}));

jest.mock('@/components/help/contents/card-rates-help', () => ({
  cardRatesHelpTitle: 'Ajuda',
  cardRatesHelpDescription: 'desc',
  cardRatesHelpIcon: () => null,
  getCardRatesHelpTabs: () => [],
}));

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('TaxasCartaoSettings', () => {
  beforeEach(() => {
    mockList.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockDelete.mockReset();
  });

  it('carrega taxas e mostra empty state', async () => {
    mockList.mockResolvedValueOnce({ data: [] });

    renderWithQuery(<TaxasCartaoSettings />);

    await waitFor(() => {
      expect(mockList).toHaveBeenCalled();
    });
    expect(await screen.findByText(/nenhuma taxa configurada/i)).toBeInTheDocument();
  });

  it('mostra a tabela quando taxas existem', async () => {
    mockList.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          acquirerCnpj: '00000000000000',
          acquirerName: 'Cielo',
          debitRate: 1.5,
          creditRate: 2.5,
          installmentRates: { '2': 3.0 },
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
    });

    renderWithQuery(<TaxasCartaoSettings />);

    expect(await screen.findByText('Cielo')).toBeInTheDocument();
    expect(screen.getByText(/1\.50%/)).toBeInTheDocument();
    expect(screen.getByText(/2\.50%/)).toBeInTheDocument();
  });

  it('cria nova taxa via botão Criar Primeira Taxa', async () => {
    mockList.mockResolvedValueOnce({ data: [] });
    mockCreate.mockResolvedValueOnce({ data: { id: '2' } });

    const user = userEvent.setup();
    renderWithQuery(<TaxasCartaoSettings />);

    await waitFor(() => {
      expect(screen.getByText(/nenhuma taxa configurada/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /criar primeira taxa/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
