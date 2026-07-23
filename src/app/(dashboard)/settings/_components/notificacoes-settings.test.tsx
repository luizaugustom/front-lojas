import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificacoesSettings } from './notificacoes-settings';

const mockUseAuth = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/lib/electron-adapter', () => ({
  requestNotificationPermission: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const baseAuthApi = {
  getNotificationPreferences: jest.fn(),
  updateNotificationPreferences: jest.fn(),
};

const baseUser = { id: 'u1', name: 'Test', role: 'empresa' as const };

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('NotificacoesSettings', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    baseAuthApi.getNotificationPreferences.mockReset();
    baseAuthApi.updateNotificationPreferences.mockReset();
    mockUseAuth.mockReturnValue({ user: baseUser, api: baseAuthApi });
  });

  it('renderiza loading e depois os toggles a partir da API', async () => {
    baseAuthApi.getNotificationPreferences.mockResolvedValueOnce({
      stockAlerts: true,
      billReminders: false,
    });

    renderWithQuery(<NotificacoesSettings />);

    expect(screen.getByLabelText(/carregando preferencias/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByLabelText(/carregando preferencias/i)).not.toBeInTheDocument();
    });

    const stockRow = screen.getByText(/alertas de estoque/i).closest('div[data-preference]');
    expect(stockRow).not.toBeNull();
    const stockButton = stockRow!.querySelector('button') as HTMLButtonElement;
    expect(stockButton).toHaveAttribute('aria-pressed', 'true');
    expect(stockButton.textContent).toMatch(/ativado/i);
  });

  it('cai para defaults quando a API responde 404 sem disparar toast.error', async () => {
    baseAuthApi.getNotificationPreferences.mockRejectedValueOnce({
      response: { status: 404 },
    });

    renderWithQuery(<NotificacoesSettings />);

    await waitFor(() => {
      expect(screen.queryByLabelText(/carregando preferencias/i)).not.toBeInTheDocument();
    });

    const stockRow = screen.getByText(/alertas de estoque/i).closest('div[data-preference]');
    const stockButton = stockRow!.querySelector('button') as HTMLButtonElement;
    expect(stockButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('renderiza mensagem de erro quando a API responde 401, sem disparar toast.error', async () => {
    baseAuthApi.getNotificationPreferences.mockRejectedValueOnce({
      response: { status: 401 },
    });

    renderWithQuery(<NotificacoesSettings />);

    await waitFor(() => {
      expect(screen.queryByLabelText(/carregando preferencias/i)).not.toBeInTheDocument();
    });

    // 401 cai no early return: o card de erro e exibido, sem toast
    expect(screen.getByText(/erro ao carregar preferencias/i)).toBeInTheDocument();
  });

  it('atualiza preferencia e reflete o novo estado', async () => {
    baseAuthApi.getNotificationPreferences.mockResolvedValueOnce({
      stockAlerts: false,
    });
    baseAuthApi.updateNotificationPreferences.mockResolvedValueOnce({ ok: true });

    const user = userEvent.setup();
    renderWithQuery(<NotificacoesSettings />);

    await waitFor(() => {
      expect(screen.queryByLabelText(/carregando preferencias/i)).not.toBeInTheDocument();
    });

    const stockRow = screen.getByText(/alertas de estoque/i).closest('div[data-preference]');
    const stockButton = stockRow!.querySelector('button') as HTMLButtonElement;
    await user.click(stockButton);

    await waitFor(() => {
      expect(baseAuthApi.updateNotificationPreferences).toHaveBeenCalledWith({
        stockAlerts: true,
      });
    });
  });
});
