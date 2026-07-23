import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DadosFiscaisSettings } from './dados-fiscais-settings';

const mockGetFiscalConfig = jest.fn();
const mockUpdateFiscalConfig = jest.fn();

jest.mock('@/lib/api-endpoints', () => ({
  companyApi: {
    getFiscalConfig: () => mockGetFiscalConfig(),
    updateFiscalConfig: (data: unknown) => mockUpdateFiscalConfig(data),
  },
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('DadosFiscaisSettings', () => {
  beforeEach(() => {
    mockGetFiscalConfig.mockReset();
    mockUpdateFiscalConfig.mockReset();
  });

  it('carrega configuração inicial e mostra o formulário', async () => {
    mockGetFiscalConfig.mockResolvedValueOnce({
      data: { taxRegime: 'SIMPLES_NACIONAL', stateRegistration: '123', municipioIbge: '4205407' },
    });

    renderWithQuery(<DadosFiscaisSettings />);

    await waitFor(() => expect(mockGetFiscalConfig).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.getByLabelText(/regime tributário/i)).toBeInTheDocument();
    });
  });

  it('salva dados fiscais quando o município é válido', async () => {
    mockGetFiscalConfig.mockResolvedValueOnce({
      data: { taxRegime: 'SIMPLES_NACIONAL', stateRegistration: '123', municipioIbge: '4205407' },
    });
    mockUpdateFiscalConfig.mockResolvedValueOnce({ data: { ok: true } });

    const user = userEvent.setup();
    renderWithQuery(<DadosFiscaisSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/código ibge do município/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /salvar dados fiscais/i }));

    await waitFor(() => {
      expect(mockUpdateFiscalConfig).toHaveBeenCalled();
    });
    const payload = mockUpdateFiscalConfig.mock.calls[0][0];
    expect(payload).toHaveProperty('municipioIbge', '4205407');
    expect(payload).toHaveProperty('taxRegime');
  });

  it('exibe erro de validação quando município IBGE tem tamanho incorreto', async () => {
    const toastError = jest.fn();
    jest.requireMock('react-hot-toast').toast.error = toastError;
    mockGetFiscalConfig.mockResolvedValueOnce({
      data: { taxRegime: 'SIMPLES_NACIONAL', municipioIbge: '123' },
    });

    const user = userEvent.setup();
    renderWithQuery(<DadosFiscaisSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/código ibge do município/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /salvar dados fiscais/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/7 d[ií]gitos/i));
    });
    expect(mockUpdateFiscalConfig).not.toHaveBeenCalled();
  });
});
