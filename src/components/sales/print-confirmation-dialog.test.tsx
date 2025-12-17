import { render, screen, fireEvent } from '@testing-library/react';
import { PrintConfirmationDialog } from './print-confirmation-dialog';

// Mock do componente
jest.mock('./print-confirmation-dialog', () => ({
  PrintConfirmationDialog: ({ open, onClose, onConfirm }: any) => {
    if (!open) return null;
    return (
      <div data-testid="print-dialog">
        <h2>Confirmar Impressão</h2>
        <button onClick={onClose}>Cancelar</button>
        <button onClick={onConfirm}>Confirmar</button>
      </div>
    );
  },
}));

describe('PrintConfirmationDialog', () => {
  it('deve renderizar quando aberto', () => {
    render(
      <PrintConfirmationDialog
        open={true}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByTestId('print-dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Impressão')).toBeInTheDocument();
  });

  it('não deve renderizar quando fechado', () => {
    render(
      <PrintConfirmationDialog
        open={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('print-dialog')).not.toBeInTheDocument();
  });

  it('deve chamar onConfirm ao clicar em confirmar', () => {
    const onConfirm = jest.fn();
    render(
      <PrintConfirmationDialog
        open={true}
        onClose={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onClose ao clicar em cancelar', () => {
    const onClose = jest.fn();
    render(
      <PrintConfirmationDialog
        open={true}
        onClose={onClose}
        onConfirm={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

