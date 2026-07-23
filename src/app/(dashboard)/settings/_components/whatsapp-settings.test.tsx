import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WhatsAppSettings } from './whatsapp-settings';

const mockGetInstanceStatus = jest.fn();

let mockUser: { role?: string } | null = { role: 'empresa' };

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    api: { get: jest.fn(), patch: jest.fn() },
  }),
}));

jest.mock('@/lib/api-endpoints', () => ({
  whatsappApi: {
    getInstanceStatus: () => mockGetInstanceStatus(),
  },
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('WhatsAppSettings', () => {
  beforeEach(() => {
    mockGetInstanceStatus.mockReset();
    mockGetInstanceStatus.mockResolvedValue({
      data: { hasInstance: false, connected: false, status: 'disconnected' },
    });
  });

  it('renderiza para empresa usando WhatsAppGlobalStatus', async () => {
    mockUser = { role: 'empresa' };

    renderWithQuery(<WhatsAppSettings />);

    await waitFor(() => {
      expect(mockGetInstanceStatus).toHaveBeenCalled();
    });
  });

  it('renderiza para admin usando WhatsAppConnectionCard', async () => {
    mockUser = { role: 'admin' };

    renderWithQuery(<WhatsAppSettings />);

    // Conexão card chama o endpoint para montar a tela
    expect(mockGetInstanceStatus).toHaveBeenCalled();
  });
});
