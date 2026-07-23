import { render, screen } from '@testing-library/react';
import { SettingsHub } from './settings-hub';

const mockUseAuth = jest.fn();
const mockUseCompany = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/hooks/useCompany', () => ({
  useCompany: () => mockUseCompany(),
}));

jest.mock('next/link', () => {
  const LinkMock = ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  LinkMock.displayName = 'LinkMock';
  return LinkMock;
});

const baseUser = {
  id: 'u1',
  name: 'Test',
  role: 'empresa' as const,
  companyId: 'c1',
};

describe('SettingsHub', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: baseUser });
    mockUseCompany.mockReturnValue({ company: null, loading: false });
  });

  it('renders header and help affordance with categories visible to the role', () => {
    render(<SettingsHub />);

    expect(
      screen.getByRole('heading', { level: 1, name: /configura/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ajuda/i })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Empresa' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Dados Fiscais' }),
    ).toBeInTheDocument();

    const empresaCard = screen
      .getByRole('heading', { name: 'Empresa' })
      .closest('[data-settings-card]');
    expect(empresaCard?.querySelector('a')).toHaveAttribute('href', '/settings/empresa');

    const dadosFiscaisCard = screen
      .getByRole('heading', { name: 'Dados Fiscais' })
      .closest('[data-settings-card]');
    expect(dadosFiscaisCard?.querySelector('a')).toHaveAttribute(
      'href',
      '/settings/dados-fiscais',
    );
  });

  it('shows loading skeleton while the company data is being fetched for the empresa role', () => {
    mockUseCompany.mockReturnValue({ company: null, loading: true });

    render(<SettingsHub />);

    expect(screen.getByLabelText(/carregando/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /empresa/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /cat.logo/i })).not.toBeInTheDocument();
  });

  it('does not show loading skeleton for non-empresa roles', () => {
    mockUseAuth.mockReturnValue({ user: { ...baseUser, role: 'admin' } });
    mockUseCompany.mockReturnValue({ company: null, loading: true });

    render(<SettingsHub />);

    expect(screen.queryByLabelText(/carregando/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument();
  });

  it('renders a blocked card as non-navigable with aria-disabled and without a link', () => {
    mockUseCompany.mockReturnValue({
      company: { plan: 'BASIC' },
      loading: false,
    });

    render(<SettingsHub />);

    const catalogHeading = screen.getByRole('heading', { name: 'Catálogo' });
    const card = catalogHeading.closest('[data-settings-card]') as HTMLElement;

    expect(card).not.toBeNull();
    expect(card.querySelector('a')).toBeNull();
    expect(card.querySelector('[aria-disabled="true"]')).not.toBeNull();
    expect(card).toHaveAttribute('data-locked', 'true');
    expect(card.textContent).toMatch(/plano PRO/i);
  });

  it('hides categories the role cannot see', () => {
    mockUseAuth.mockReturnValue({ user: { ...baseUser, role: 'vendedor' } });

    render(<SettingsHub />);

    expect(screen.queryByRole('link', { name: /empresa/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument();
    expect(screen.getByText(/nenhuma/i)).toBeInTheDocument();
  });
});