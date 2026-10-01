import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('retorna a condição correspondente a um código WMO conhecido', () => {
    expect(getWeatherCondition(3).label).toBe('Encoberto');
  });

  it('usa indisponível para códigos desconhecidos ou ausentes', () => {
    expect(getWeatherCondition(999).label).toBe('Indisponível');
    expect(getWeatherCondition(undefined).label).toBe('Indisponível');
  });
});
