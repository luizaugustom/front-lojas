import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdministracaoSettings } from './administracao-settings';

const mockUseAuth = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/lib/api-endpoints', () => {
  const adminApi = {
    getFocusNfeConfig: jest.fn(),
    updateFocusNfeConfig: jest.fn(),
  };
  const managerApi = {
    myCompanies: jest.fn(),
  };
  return { adminApi, managerApi };
});

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import { adminApi, managerApi } from '@/lib/api-endpoints';

const baseAuthApi = {
  changeCompanyPassword: jest.fn(),
};

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('AdministracaoSettings', () => {
  beforeEach(() => {
    (adminApi.getFocusNfeConfig as jest.Mock).mockReset();
    (adminApi.updateFocusNfeConfig as jest.Mock).mockReset();
    (managerApi.myCompanies as jest.Mock).mockReset();
    baseAuthApi.changeCompanyPassword.mockReset();
  });

  it('mostra IBPT global e oculta a secao de gestor quando o papel e admin', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'a1', name: 'Admin', role: 'admin' },
      api: baseAuthApi,
    });
    (adminApi.getFocusNfeConfig as jest.Mock).mockResolvedValueOnce({
      data: { ibptToken: 'token-xyz', hasIbptToken: true },
    });

    renderWithQuery(<AdministracaoSettings />);

    await waitFor(() => {
      expect(screen.getByText(/token ibpt global/i)).toBeInTheDocument();
    });
    expect(screen.getByTestId('ibpt-configured-flag')).toBeInTheDocument();
    expect(screen.queryByText(/senha de login das empresas/i)).not.toBeInTheDocument();
  });

  it('mostra lista de empresas do gestor e oculta a secao admin quando o papel e gestor', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'g1', name: 'Gestor', role: 'gestor' },
      api: baseAuthApi,
    });
    (managerApi.myCompanies as jest.Mock).mockResolvedValue({
      data: [
        { id: 'c1', name: 'Loja Centro' },
        { id: 'c2', fantasyName: 'Loja Norte' },
      ],
    });

    renderWithQuery(<AdministracaoSettings />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /senha de login das empresas/i })).toBeInTheDocument();
    });
    expect(await screen.findByText('Loja Centro')).toBeInTheDocument();
    expect(await screen.findByText('Loja Norte')).toBeInTheDocument();
    expect(screen.queryByText(/token ibpt global/i)).not.toBeInTheDocument();
  });

  it('renderiza estado vazio quando o gestor nao possui empresas vinculadas', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'g2', name: 'Gestor', role: 'gestor' },
      api: baseAuthApi,
    });
    (managerApi.myCompanies as jest.Mock).mockResolvedValue({ data: [] });

    renderWithQuery(<AdministracaoSettings />);

    await waitFor(() => {
      expect(screen.getByText(/nenhuma empresa vinculada ao seu perfil/i)).toBeInTheDocument();
    });
  });

  it('nao monta conteudo relevante quando o papel e empresa', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'e1', name: 'Empresa', role: 'empresa' },
      api: baseAuthApi,
    });

    renderWithQuery(<AdministracaoSettings />);

    expect(
      screen.getByText(/categoria nao disponivel para este perfil/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/token ibpt global/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/senha de login das empresas/i)).not.toBeInTheDocument();
  });

  it('nao monta conteudo relevante quando o papel e vendedor', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'v1', name: 'Vendedor', role: 'vendedor' },
      api: baseAuthApi,
    });

    renderWithQuery(<AdministracaoSettings />);

    expect(
      screen.getByText(/categoria nao disponivel para este perfil/i),
    ).toBeInTheDocument();
  });
});
