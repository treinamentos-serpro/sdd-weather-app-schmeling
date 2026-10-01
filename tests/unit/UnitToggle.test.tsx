import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

function ControlledToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');
  return <UnitToggle unit={unit} onChange={setUnit} />;
}

describe('UnitToggle', () => {
  it('expõe grupo, nomes acessíveis e estado pressionado', () => {
    render(<ControlledToggle />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('alterna por setas e mantém o foco no botão selecionado', async () => {
    const user = userEvent.setup();
    render(<ControlledToggle />);

    const celsius = screen.getByRole('button', { name: 'Celsius' });
    const fahrenheit = screen.getByRole('button', { name: 'Fahrenheit' });
    await user.tab();
    expect(celsius).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(fahrenheit).toHaveFocus();
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(celsius).toHaveFocus();
    expect(celsius).toHaveAttribute('aria-pressed', 'true');
  });

  it('aceita clique, Enter e Espaço nos botões nativos', async () => {
    const user = userEvent.setup();
    render(<ControlledToggle />);

    const celsius = screen.getByRole('button', { name: 'Celsius' });
    const fahrenheit = screen.getByRole('button', { name: 'Fahrenheit' });
    await user.click(fahrenheit);
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');

    celsius.focus();
    await user.keyboard('{Enter}');
    expect(celsius).toHaveAttribute('aria-pressed', 'true');

    fahrenheit.focus();
    await user.keyboard(' ');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
  });
});
