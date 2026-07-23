import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParcelamentoSettings } from './parcelamento-settings';

const mockGet = jest.fn();
const mockUpdateMyCompany = jest.fn();

const stableAuth = { api: { get: mockGet } };
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => stableAuth,
}));

jest.mock('@/lib/api-endpoints', () => ({
  companyApi: {
    updateMyCompany: (data: unknown) => mockUpdateMyCompany(data),
  },
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('ParcelamentoSettings', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockUpdateMyCompany.mockReset();
  });

  it('carrega e mostra a configuração existente', async () => {
    mockGet.mockResolvedValue({
      data: { maxInstallments: 6, installmentInterestRates: { '1': 0, '2': 2.5 } },
    });

    renderWithQuery(<ParcelamentoSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/limite máximo de parcelas/i)).toBeInTheDocument();
    });
  });

  it('salva quando configurado com sucesso', async () => {
    mockGet.mockResolvedValue({ data: { maxInstallments: 12, installmentInterestRates: {} } });
    mockUpdateMyCompany.mockResolvedValue({ data: { ok: true } });

    const user = userEvent.setup();
    renderWithQuery(<ParcelamentoSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/limite máximo de parcelas/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /salvar configurações/i }));

    await waitFor(() => {
      expect(mockUpdateMyCompany).toHaveBeenCalled();
    });
    const payload = mockUpdateMyCompany.mock.calls[0][0];
    expect(payload).toHaveProperty('maxInstallments');
    expect(payload).toHaveProperty('installmentInterestRates');
  });

  it('bloqueia salvar quando maxInstallments esta fora do intervalo', async () => {
    const toastError = jest.fn();
    jest.requireMock('react-hot-toast').toast.error = toastError;
    mockGet.mockResolvedValue({ data: { maxInstallments: 25, installmentInterestRates: {} } });

    const user = userEvent.setup();
    renderWithQuery(<ParcelamentoSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/limite máximo de parcelas/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /salvar configurações/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/entre 0 e 24/i));
    });
    expect(mockUpdateMyCompany).not.toHaveBeenCalled();
  });
});
