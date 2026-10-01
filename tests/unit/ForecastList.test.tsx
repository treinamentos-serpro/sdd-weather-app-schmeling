import { render, screen, within } from '@testing-library/react';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/types/weather';

describe('ForecastList', () => {
  it('mostra cinco dias locais na ordem, com condição, temperaturas e chuva', () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="celsius" />);

    const cards = within(screen.getByRole('region', { name: 'Previsão de 5 dias' })).getAllByRole(
      'listitem',
    );
    expect(cards).toHaveLength(5);
    for (const [index, day] of mockWeatherData.forecast.entries()) {
      expect(cards[index].querySelector('time')).toHaveAttribute('datetime', day.date);
    }
    expect(within(cards[0]).getByText(/30.*set/i)).toBeInTheDocument();
    expect(within(cards[0]).getByText('Encoberto')).toBeInTheDocument();
    expect(within(cards[0]).getByText('23,8 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('15,2 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('20%')).toBeInTheDocument();
  });

  it('converte máximas e mínimas sem alterar a probabilidade', () => {
    const { rerender } = render(
      <ForecastList forecast={mockWeatherData.forecast} unit="celsius" />,
    );

    rerender(<ForecastList forecast={mockWeatherData.forecast} unit="fahrenheit" />);
    const firstCard = screen.getAllByRole('listitem')[0];
    expect(within(firstCard).getByText('74,8 °F')).toBeInTheDocument();
    expect(within(firstCard).getByText('59,4 °F')).toBeInTheDocument();
    expect(within(firstCard).getByText('20%')).toBeInTheDocument();
  });

  it('mantém a data e identifica medições ausentes e condição desconhecida', () => {
    render(
      <ForecastList
        forecast={[
          {
            ...mockWeatherData.forecast[0],
            weatherCode: 999,
            minimumTemperatureC: undefined,
            maximumTemperatureC: undefined,
            maximumPrecipitationProbability: undefined,
          },
        ]}
        unit="celsius"
      />,
    );

    const card = screen.getByRole('listitem');
    expect(within(card).getByText(/30.*set/i)).toBeInTheDocument();
    expect(within(card).getAllByText('Indisponível')).toHaveLength(4);
  });

  it('exibe valores válidos e identifica somente as métricas ausentes', () => {
    render(
      <ForecastList
        forecast={[
          {
            ...mockWeatherData.forecast[0],
            minimumTemperatureC: 15.2,
            maximumTemperatureC: undefined,
            maximumPrecipitationProbability: undefined,
          },
        ]}
        unit="celsius"
      />,
    );

    const card = screen.getByRole('listitem');
    expect(within(card).getByText('Encoberto')).toBeInTheDocument();
    expect(within(card).getByText('15,2 °C')).toBeInTheDocument();
    expect(within(card).getAllByText('Indisponível')).toHaveLength(2);
  });

  it('substitui métricas não finitas por indisponível', () => {
    render(
      <ForecastList
        forecast={[
          {
            ...mockWeatherData.forecast[0],
            weatherCode: Number.NaN,
            minimumTemperatureC: Number.NaN,
            maximumTemperatureC: Number.POSITIVE_INFINITY,
            maximumPrecipitationProbability: Number.NEGATIVE_INFINITY,
          },
        ]}
        unit="celsius"
      />,
    );

    const card = screen.getByRole('listitem');
    expect(within(card).getAllByText('Indisponível')).toHaveLength(4);
    expect(within(card).queryByText(/NaN|Infinity|∞/)).not.toBeInTheDocument();
  });

  it('informa quando não há previsão', () => {
    render(<ForecastList forecast={[]} unit="celsius" />);

    expect(screen.getByText('Previsão indisponível.')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
