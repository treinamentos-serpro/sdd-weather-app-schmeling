import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('estados de feedback', () => {
  it('anuncia o carregamento em uma região de status', () => {
    render(<LoadingState message="Buscando cidades..." />);

    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades...');
  });

  it('exibe o erro em uma região de alerta e chama retry por clique ou teclado', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState message="Não foi possível carregar o clima." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o clima.');
    const button = screen.getByRole('button', { name: 'Tentar novamente' });
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('mostra título e dica no estado sem resultados', () => {
    render(<EmptyState />);

    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.getByText('Tente buscar outra cidade.')).toBeInTheDocument();
  });

  it('trata mensagens personalizadas como texto literal', () => {
    const maliciousText = '<script>alert(1)</script>';
    const { container } = render(
      <>
        <EmptyState title="Sem resultados" hint={maliciousText} />
        <ErrorState message={maliciousText} onRetry={vi.fn()} />
      </>,
    );

    expect(screen.getAllByText(maliciousText)).toHaveLength(2);
    expect(container.querySelector('script')).toBeNull();
  });
});
