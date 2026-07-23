import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MensagensAutomaticasSettings } from './mensagens-automaticas-settings';

const mockGet = jest.fn();
const mockPatch = jest.fn();
const stableAuth = { api: { get: mockGet, patch: mockPatch } };

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => stableAuth,
}));

const mockCompany = jest.fn();
jest.mock('@/hooks/useCompany', () => ({
  useCompany: () => mockCompany(),
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('MensagensAutomaticasSettings', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
    mockCompany.mockReset();
  });

  it('carrega o status inicial e mostra o status Desativado', async () => {
    mockGet.mockResolvedValueOnce({
      data: { autoMessageEnabled: false, totalUnpaidInstallments: 0, totalMessagesSent: 0 },
    });
    mockCompany.mockReturnValue({ company: { plan: 'PRO' }, loading: false });

    renderWithQuery(<MensagensAutomaticasSettings />);

    await waitFor(() => {
      expect(screen.getByText(/status: desativado/i)).toBeInTheDocument();
    });
  });

  it('permite desativar quando o serviço está ativo', async () => {
    mockGet.mockResolvedValue({
      data: { autoMessageEnabled: true, totalUnpaidInstallments: 2, totalMessagesSent: 5 },
    });
    mockPatch.mockResolvedValueOnce({ data: { message: 'Mensagens automáticas desativadas' } });
    mockCompany.mockReturnValue({ company: { plan: 'PRO' }, loading: false });

    const user = userEvent.setup();
    renderWithQuery(<MensagensAutomaticasSettings />);

    await waitFor(() => {
      expect(screen.getByText(/status: ativado/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /desativar/i }));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/company/my-company/auto-message/disable');
    });
  });

  it('mostra alerta quando whatsapp não está conectado', async () => {
    const toastError = jest.fn();
    jest.requireMock('react-hot-toast').toast.error = toastError;
    mockGet.mockResolvedValue({ data: { autoMessageEnabled: false } });
    mockCompany.mockReturnValue({ company: { plan: 'PRO' }, loading: false });

    renderWithQuery(<MensagensAutomaticasSettings />);

    await waitFor(() => {
      expect(screen.getByText(/whatsapp do sistema não está conectado/i)).toBeInTheDocument();
    });
    const ativar = screen.getByRole('button', { name: /ativar/i });
    expect(ativar).toBeDisabled();
    expect(mockPatch).not.toHaveBeenCalled();
  });
});
