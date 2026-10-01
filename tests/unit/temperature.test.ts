import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature', () => {
  it('converte os pontos de referência de Celsius para Fahrenheit', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('mantém a temperatura quando a unidade é Celsius', () => {
    expect(convertTemperature(18.5, 'celsius')).toBe(18.5);
  });

  it('arredonda a uma casa decimal e inclui o símbolo da unidade', () => {
    expect(formatTemperature(18.56, 'celsius')).toBe('18,6 °C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32,0 °F');
  });

  it('retorna uma mensagem para temperatura indisponível', () => {
    expect(formatTemperature(undefined, 'celsius')).toBe('Indisponível');
  });

  it('não formata temperaturas não finitas ou com conversão infinita', () => {
    expect(formatTemperature(Number.NaN, 'fahrenheit')).toBe('Indisponível');
    expect(formatTemperature(Number.POSITIVE_INFINITY, 'fahrenheit')).toBe('Indisponível');
    expect(formatTemperature(Number.NEGATIVE_INFINITY, 'fahrenheit')).toBe('Indisponível');
    expect(formatTemperature(1e308, 'fahrenheit')).toBe('Indisponível');
  });

  it('retorna o símbolo correspondente à unidade', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
