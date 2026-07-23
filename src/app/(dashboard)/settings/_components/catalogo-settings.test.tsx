import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CatalogoSettings } from './catalogo-settings';

const mockGet = jest.fn();
const mockPatch = jest.fn();
const mockAuthApi = { get: mockGet, patch: mockPatch };

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ api: mockAuthApi }),
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

describe('CatalogoSettings', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
    mockCompany.mockReset();
  });

  it('carrega a configuração inicial com plano PRO', async () => {
    mockGet.mockResolvedValueOnce({
      data: { catalogPageUrl: 'minha-loja', catalogPageEnabled: true, catalogPageAllowed: true },
    });
    mockCompany.mockReturnValue({ company: { plan: 'PRO' }, loading: false });

    renderWithQuery(<CatalogoSettings />);

    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.getByLabelText(/url da página/i)).toHaveValue('minha-loja');
    });
  });

  it('salva configuração com URL e ativa quando plano é PRO', async () => {
    mockGet.mockResolvedValueOnce({ data: { catalogPageUrl: '', catalogPageEnabled: false } });
    mockPatch.mockResolvedValueOnce({ data: { ok: true } });
    mockCompany.mockReturnValue({ company: { plan: 'PRO' }, loading: false });

    const user = userEvent.setup();
    renderWithQuery(<CatalogoSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/url da página/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/url da página/i), 'minha-loja');
    await user.click(screen.getByRole('button', { name: /salvar configurações/i }));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalled();
    });
    const payload = mockPatch.mock.calls[0][1];
    expect(payload).toMatchObject({ catalogPageUrl: 'minha-loja' });
  });

  it('mostra aviso de bloqueio quando o plano não é PRO', async () => {
    mockGet.mockResolvedValueOnce({ data: { catalogPageUrl: 'loja', catalogPageEnabled: false } });
    mockCompany.mockReturnValue({ company: { plan: 'BASIC' }, loading: false });

    renderWithQuery(<CatalogoSettings />);

    await waitFor(() => {
      expect(screen.getByText(/apenas para plano Pro/i)).toBeInTheDocument();
    });
  });
});
