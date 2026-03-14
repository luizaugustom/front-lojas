import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestApiPage from './page';

const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    api: {
      get: mockGet,
      post: mockPost,
    },
  }),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Test API Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ status: 200, data: {} });
  });

  it('deve renderizar o título e o botão de executar testes', () => {
    render(<TestApiPage />);
    expect(screen.getByText('Testes da API')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /executar todos os testes/i })).toBeInTheDocument();
  });

  it('deve exibir mensagem inicial quando não há resultados', () => {
    render(<TestApiPage />);
    expect(screen.getByText(/clique em .*executar todos os testes/i)).toBeInTheDocument();
  });

  it('deve executar os testes ao clicar no botão e exibir resultados', async () => {
    render(<TestApiPage />);
    const button = screen.getByRole('button', { name: /executar todos os testes/i });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: /executando/i })).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalled();

    await waitFor(
      () => {
        expect(screen.getByText('Auth/Admin')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('deve exibir falha quando um endpoint retorna erro', async () => {
    mockGet.mockRejectedValueOnce({
      response: { status: 500, data: { message: 'Erro interno' } },
      message: 'Erro',
    });

    render(<TestApiPage />);
    fireEvent.click(screen.getByRole('button', { name: /executar todos os testes/i }));

    await waitFor(
      () => {
        expect(screen.getByText('Auth/Admin')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
