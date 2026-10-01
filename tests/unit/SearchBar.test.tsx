import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('envia o nome normalizado pelo botão e pela tecla Enter', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    expect(screen.getByRole('search')).toBeInTheDocument();
    await user.type(input, "  São José d'Oeste  ");
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledWith("São José d'Oeste");

    await user.clear(input);
    await user.type(input, "  São José d'Oeste  ");
    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenLastCalledWith("São José d'Oeste");

    await user.clear(input);
    await user.type(input, 'Rio de Janeiro{Enter}');
    expect(onSearch).toHaveBeenLastCalledWith('Rio de Janeiro');
    expect(onSearch).toHaveBeenCalledTimes(3);
  });

  it('não envia espaços e mantém o foco no campo', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
    expect(input).toHaveValue('   ');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome da cidade.');
  });

  it('não chama onSearch quando o input está vazio', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    expect(screen.getByRole('combobox', { name: 'Cidade' })).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('não envia campo vazio ou só espaços por Enter e mantém o foco', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome da cidade.');
    expect(input).toHaveFocus();

    await user.type(input, '   ');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome da cidade.');
    expect(input).toHaveFocus();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('desabilita a entrada e o envio sem apagar o texto digitado', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    await user.type(input, 'Curitiba');
    rerender(<SearchBar onSearch={onSearch} disabled />);

    expect(input).toBeDisabled();
    expect(input).toHaveValue('Curitiba');
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('mostra a consulta ativa quando ela muda sem controlar o rascunho digitado', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);

    rerender(<SearchBar onSearch={onSearch} activeQuery="São Paulo" />);
    const input = screen.getByRole('combobox', { name: 'Cidade' });
    expect(input).toHaveValue('São Paulo');

    await user.clear(input);
    await user.type(input, 'Curitiba');
    rerender(<SearchBar onSearch={onSearch} activeQuery="São Paulo" />);
    expect(input).toHaveValue('Curitiba');
  });
});
