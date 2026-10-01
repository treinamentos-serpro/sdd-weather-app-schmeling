import type { Unit } from '../types/weather';

export function convertTemperature(celsius: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function formatTemperature(celsius: number | undefined, unit: Unit): string {
  if (typeof celsius !== 'number' || !Number.isFinite(celsius)) return 'Indisponível';

  const value = convertTemperature(celsius, unit);
  if (!Number.isFinite(value)) return 'Indisponível';

  return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)} ${unitLabel(unit)}`;
}
