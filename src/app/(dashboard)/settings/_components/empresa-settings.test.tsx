import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmpresaSettings } from './empresa-settings';

const mockUseAuth = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/lib/api-endpoints', () => {
  const companyApi = {
    myCompany: jest.fn().mockResolvedValue({ data: {} }),
    updateMyCompany: jest.fn().mockResolvedValue({ data: {} }),
    uploadLogo: jest.fn().mockResolvedValue({ data: {} }),
    removeLogo: jest.fn().mockResolvedValue({ data: {} }),
  };
  return { companyApi };
});

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/lib/image-utils', () => ({
  getImageUrl: (url: string) => url,
}));

const stableSetCompanyColor = jest.fn();
jest.mock('@/store/ui-store', () => ({
  useUIStore: (selector: (s: { setCompanyColor: jest.Mock }) => unknown) =>
    selector({ setCompanyColor: stableSetCompanyColor }),
}));

const baseAuthApi = {
  get: jest.fn().mockResolvedValue({ data: {} }),
  getProfile: jest.fn().mockResolvedValue({ id: 'u1', name: 'Test', email: 'a@b.com', login: 'user' }),
  updateProfile: jest.fn().mockResolvedValue({ ok: true }),
  changePassword: jest.fn().mockResolvedValue({ ok: true }),
};

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

const setAuthAs = (role: 'empresa' | 'admin' | 'gestor') => {
  mockUseAuth.mockReturnValue({
    user: { id: 'u1', name: 'Test', role },
    api: baseAuthApi,
  });
};

describe('EmpresaSettings', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    baseAuthApi.get.mockClear();
    baseAuthApi.getProfile.mockClear();
    baseAuthApi.updateProfile.mockClear();
  });

  it('empresa: 3 abas com Dados da empresa ativa por padrao', async () => {
    setAuthAs('empresa');
    baseAuthApi.get.mockResolvedValueOnce({ data: { brandColor: '#3B82F6', fantasyName: 'Minha' } });

    renderWithQuery(<EmpresaSettings />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /dados da empresa/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('tab', { name: /meu perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /seguranca/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /dados da empresa/i })).toHaveAttribute(
      'data-state',
      'active',
    );
  });

  it('admin: oculta Dados da empresa, apenas Meu perfil e Seguranca; Meu perfil ativo', async () => {
    setAuthAs('admin');
    renderWithQuery(<EmpresaSettings />);

    await waitFor(() => expect(baseAuthApi.getProfile).toHaveBeenCalled());

    await waitFor(
      () => {
        expect(screen.queryByLabelText(/carregando/i)).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.queryByRole('tab', { name: /dados da empresa/i })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /meu perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /meu perfil/i })).toHaveAttribute(
      'data-state',
      'active',
    );
  });

  it('admin: limpar telefone envia string vazia; campos nao alterados nao sao enviados', async () => {
    setAuthAs('admin');
    baseAuthApi.getProfile.mockResolvedValueOnce({
      id: 'u1',
      name: 'Test',
      email: 'a@b.com',
      login: 'user',
      phone: '11999990000',
    });
    baseAuthApi.updateProfile.mockResolvedValueOnce({ ok: true });

    const user = userEvent.setup();
    renderWithQuery(<EmpresaSettings />);

    await waitFor(() => expect(baseAuthApi.getProfile).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.queryByLabelText(/carregando/i)).not.toBeInTheDocument();
    });

    const phoneInput = screen.getByLabelText(/telefone/i) as HTMLInputElement;
    expect(phoneInput.value).toBe('11999990000');

    await user.clear(phoneInput);
    await user.click(screen.getByRole('button', { name: /salvar alteracoes/i }));

    await waitFor(() => {
      expect(baseAuthApi.updateProfile).toHaveBeenCalledTimes(1);
    });

    const payload = baseAuthApi.updateProfile.mock.calls[0][0];
    expect(payload).toEqual({ phone: '' });
    expect(payload).not.toHaveProperty('name');
    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('login');
  });
});
