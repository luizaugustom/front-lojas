import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CatalogEditorWizard } from './CatalogEditorWizard';
import { useCatalogEditorStore } from '@/store/catalog-editor-store';

const mockUseCatalogConfig = jest.fn();
const mockUseUpdateCatalogConfig = jest.fn();
jest.mock('@/hooks/useCatalogConfig', () => ({
  useCatalogConfig: () => mockUseCatalogConfig(),
  useUpdateCatalogConfig: () => mockUseUpdateCatalogConfig(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('CatalogEditorWizard', () => {
  beforeEach(() => {
    // Reset the real Zustand store to its initial state
    useCatalogEditorStore.getState().reset();

    mockUseCatalogConfig.mockReset();
    mockUseUpdateCatalogConfig.mockReset();
    mockPush.mockReset();

    mockUseCatalogConfig.mockReturnValue({
      data: {
        templateId: 'CLASSIC',
        texts: {
          heroTitle: 'Old title',
          heroSubtitle: '',
          aboutTitle: '',
          aboutBody: '',
          contactPhone: '',
          contactEmail: '',
          footerText: '',
        },
        colors: {
          primary: '#000000',
          secondary: '#64748b',
          accent: '#f59e0b',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#0f172a',
          textMuted: '#64748b',
          border: '#e2e8f0',
        },
        logoUrl: null,
        heroImageUrl: null,
      },
      isLoading: false,
      error: null,
    });
    mockUseUpdateCatalogConfig.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ ok: true }),
      isPending: false,
    });
  });

  it('renderiza passos do wizard na ordem correta', async () => {
    renderWithQuery(<CatalogEditorWizard />);
    await waitFor(() => {
      expect(screen.getByText(/1\.\s*Template/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/2\.\s*Textos/i)).toBeInTheDocument();
    expect(screen.getByText(/3\.\s*Cores/i)).toBeInTheDocument();
  });

  it('avança entre passos e chama update com templateId+textos', async () => {
    const mutateAsync = jest.fn().mockResolvedValue({ ok: true });
    mockUseUpdateCatalogConfig.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderWithQuery(<CatalogEditorWizard />);
    await waitFor(() => screen.getByText(/1\.\s*Template/i));

    // Avança Template → Textos
    await user.click(screen.getByRole('button', { name: /avançar/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ templateId: 'CLASSIC', texts: expect.any(Object) }),
      );
    });
    expect(useCatalogEditorStore.getState().step).toBe('texts');
  });

  it('mostra erro do toast quando update falha', async () => {
    const toast = require('react-hot-toast').toast;
    mockUseUpdateCatalogConfig.mockReturnValue({
      mutateAsync: jest.fn().mockRejectedValue(new Error('boom')),
      isPending: false,
    });
    const user = userEvent.setup();
    renderWithQuery(<CatalogEditorWizard />);
    await waitFor(() => screen.getByText(/1\.\s*Template/i));

    await user.click(screen.getByRole('button', { name: /avançar/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('hidrata store com dados carregados', async () => {
    renderWithQuery(<CatalogEditorWizard />);
    await waitFor(() => {
      const state = useCatalogEditorStore.getState();
      expect(state.templateId).toBe('CLASSIC');
      // texts são spread dos defaults — heroTitle do backend deve prevalecer
      expect(state.texts.heroTitle).toBe('Old title');
    });
  });
});
