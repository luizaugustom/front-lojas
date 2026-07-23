import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BoletosSettings } from './boletos-settings';

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

describe('BoletosSettings', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockUpdateMyCompany.mockReset();
  });

  it('carrega configuração inicial e mostra toggle desativado', async () => {
    mockGet.mockResolvedValue({
      data: { boletoAllowed: true, boletoEnabled: false, unimakeConfigured: true },
    });

    renderWithQuery(<BoletosSettings />);

    await waitFor(() => {
      expect(screen.getByText(/boleto unimake configurado/i)).toBeInTheDocument();
    });
  });

  it('salva com sucesso o boletoEnabled', async () => {
    mockGet.mockResolvedValue({ data: { boletoAllowed: true, boletoEnabled: false } });
    mockUpdateMyCompany.mockResolvedValue({ data: { ok: true } });

    const user = userEvent.setup();
    renderWithQuery(<BoletosSettings />);

    await waitFor(() => {
      expect(screen.getByText(/boleto unimake configurado/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(mockUpdateMyCompany).toHaveBeenCalledWith({ boletoEnabled: true });
    });
  });

  it('bloqueia ativar quando boletoAllowed=false', async () => {
    mockGet.mockResolvedValue({ data: { boletoAllowed: false, boletoEnabled: false } });

    renderWithQuery(<BoletosSettings />);

    await waitFor(() => {
      expect(screen.getByText(/liberação do administrador/i)).toBeInTheDocument();
    });

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();
    expect(mockUpdateMyCompany).not.toHaveBeenCalled();
  });
});
