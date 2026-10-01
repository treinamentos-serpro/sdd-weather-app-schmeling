import { formatDay, getShortDate } from '../../src/lib/format';

describe('formatDay', () => {
  it('mantém a data local e formata o dia em pt-BR', () => {
    expect(formatDay('2026-09-30')).toMatch(/30.*set/i);
    expect(formatDay('2026-10-01')).toMatch(/01.*out/i);
  });

  it('rotula os dois primeiros índices como hoje e amanhã', () => {
    expect(formatDay('2026-09-30', 0)).toBe('Hoje');
    expect(formatDay('2026-10-01', 1)).toBe('Amanhã');
  });

  it('formata os demais índices pelo dia da semana', () => {
    expect(formatDay('2026-10-02', 2)).toMatch(/sex/i);
  });

  it('não inventa rótulos para datas inválidas', () => {
    expect(formatDay('2026-02-30')).toBe('Indisponível');
    expect(formatDay('2026-13-01')).toBe('Indisponível');
    expect(formatDay('')).toBe('Indisponível');
  });
});

describe('getShortDate', () => {
  it('formata dia e mês abreviado em pt-BR', () => {
    expect(getShortDate('2026-10-01')).toMatch(/01.*out/i);
  });

  it('retorna indisponível para uma data inválida', () => {
    expect(getShortDate('2026-02-30')).toBe('Indisponível');
  });
});
