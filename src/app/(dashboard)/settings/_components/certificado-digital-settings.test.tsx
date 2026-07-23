import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CertificadoDigitalSettings } from './certificado-digital-settings';

const mockGetFiscalConfig = jest.fn();
const mockUpdateFiscalConfig = jest.fn();
const mockUploadCertificate = jest.fn();

jest.mock('@/lib/api-endpoints', () => ({
  companyApi: {
    getFiscalConfig: () => mockGetFiscalConfig(),
    updateFiscalConfig: (data: unknown) => mockUpdateFiscalConfig(data),
    uploadCertificate: (file: File) => mockUploadCertificate(file),
  },
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('CertificadoDigitalSettings', () => {
  beforeEach(() => {
    mockGetFiscalConfig.mockReset();
    mockUpdateFiscalConfig.mockReset();
    mockUploadCertificate.mockReset();
  });

  it('renderiza o formulário após carregar', async () => {
    mockGetFiscalConfig.mockResolvedValueOnce({ data: {} });

    renderWithQuery(<CertificadoDigitalSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/senha do certificado digital/i)).toBeInTheDocument();
    });
  });

  it('salva a senha do certificado e mostra sucesso', async () => {
    mockGetFiscalConfig.mockResolvedValue({ data: {} });
    mockUpdateFiscalConfig.mockResolvedValueOnce({ data: { ok: true } });

    const user = userEvent.setup();
    renderWithQuery(<CertificadoDigitalSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/senha do certificado digital/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/senha do certificado digital/i), 'minha-senha');
    await user.click(screen.getByRole('button', { name: /salvar senha/i }));

    await waitFor(() => {
      expect(mockUpdateFiscalConfig).toHaveBeenCalledWith({ certificatePassword: 'minha-senha' });
    });
  });

  it('exibe erro se o arquivo selecionado não tem extensão pfx/p12', async () => {
    const toastError = jest.fn();
    jest.requireMock('react-hot-toast').toast.error = toastError;
    mockGetFiscalConfig.mockResolvedValue({ data: {} });

    const user = userEvent.setup();
    renderWithQuery(<CertificadoDigitalSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/arquivo do certificado/i)).toBeInTheDocument();
    });

    const file = new File(['conteudo'], 'certificado.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/arquivo do certificado/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/\.pfx ou \.p12/i));
    });
    expect(mockUploadCertificate).not.toHaveBeenCalled();
  });
});
