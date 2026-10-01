const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});

function parseDate(date: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;

  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return undefined;
  }

  return parsed;
}

export function formatDay(date: string, index?: number): string {
  const parsed = parseDate(date);
  if (!parsed) return 'Indisponível';
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  return dayFormatter.format(parsed);
}

export function getShortDate(date: string): string {
  const parsed = parseDate(date);
  return parsed ? shortDateFormatter.format(parsed) : 'Indisponível';
}
