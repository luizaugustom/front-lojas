import { resolveNextExpectedPunchState } from './next-expected-punch-state';

describe('resolveNextExpectedPunchState', () => {
  it('não trata ausência de dados como jornada completa', () => {
    expect(
      resolveNextExpectedPunchState({
        loading: false,
        ready: false,
        nextType: null,
      }),
    ).toEqual({ kind: 'idle' });
  });

  it('mostra loading enquanto busca my-today', () => {
    expect(
      resolveNextExpectedPunchState({
        loading: true,
        ready: false,
        nextType: null,
      }),
    ).toEqual({ kind: 'loading' });
  });

  it('mostra próxima marcação quando nextType veio da API', () => {
    expect(
      resolveNextExpectedPunchState({
        loading: false,
        ready: true,
        nextType: 'ENTRY',
      }),
    ).toEqual({ kind: 'next', nextType: 'ENTRY' });
  });

  it('só mostra jornada completa quando ready e nextType é null', () => {
    expect(
      resolveNextExpectedPunchState({
        loading: false,
        ready: true,
        nextType: null,
      }),
    ).toEqual({ kind: 'complete' });
  });
});
