import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastList from '../../src/components/ForecastList';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';
import { mockWeatherData } from '../../src/types/weather';

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={mockWeatherData.city}
        current={{ ...mockWeatherData.current, temperatureC: 0, apparentTemperatureC: 100 }}
        unit={unit}
      />
      <ForecastList
        forecast={[
          {
            ...mockWeatherData.forecast[0],
            minimumTemperatureC: 0,
            maximumTemperatureC: 100,
          },
        ]}
        unit={unit}
      />
    </>
  );
}

describe('CurrentWeather', () => {
  it('exibe cidade, condição e métricas em pt-BR', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('region', { name: 'Clima atual' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByText('18,5 °C')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: 17,2 °C')).toBeInTheDocument();
    expect(screen.getByText('Encoberto')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('10 km/h')).toBeInTheDocument();
    expect(screen.getByText('0,2 mm')).toBeInTheDocument();
    expect(screen.getByText('1013,2 hPa')).toBeInTheDocument();
  });

  it('converte apenas as temperaturas quando a unidade muda', () => {
    const { rerender } = render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="celsius"
      />,
    );

    rerender(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="fahrenheit"
      />,
    );
    expect(screen.getByText('65,3 °F')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: 63,0 °F')).toBeInTheDocument();
    expect(screen.getByText('0,2 mm')).toBeInTheDocument();
    expect(screen.getByText('1013,2 hPa')).toBeInTheDocument();
  });

  it('converte 0 °C e 100 °C para Fahrenheit e volta sem arredondar a origem', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    const currentWeather = screen.getByRole('region', { name: 'Clima atual' });
    const forecast = screen.getByRole('region', { name: 'Previsão de 5 dias' });
    expect(within(currentWeather).getByText('32,0 °F')).toBeInTheDocument();
    expect(within(currentWeather).getByText('Sensação térmica: 212,0 °F')).toBeInTheDocument();
    expect(within(forecast).getByText('32,0 °F')).toBeInTheDocument();
    expect(within(forecast).getByText('212,0 °F')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Celsius' }));
    expect(within(currentWeather).getByText('0,0 °C')).toBeInTheDocument();
    expect(within(currentWeather).getByText('Sensação térmica: 100,0 °C')).toBeInTheDocument();
    expect(within(forecast).getByText('0,0 °C')).toBeInTheDocument();
    expect(within(forecast).getByText('100,0 °C')).toBeInTheDocument();
  });

  it('identifica campos ausentes e códigos WMO desconhecidos', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={{
          temperatureC: undefined,
          apparentTemperatureC: undefined,
          weatherCode: 999,
          relativeHumidity: undefined,
          windSpeedKmh: undefined,
          precipitationMm: undefined,
          pressureMslHpa: undefined,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getAllByText('Indisponível')).toHaveLength(6);
    expect(screen.getByText('Sensação térmica: Indisponível')).toBeInTheDocument();
  });

  it('exibe fallback para métricas não finitas sem mostrar NaN ou infinito', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={{
          temperatureC: Number.NaN,
          apparentTemperatureC: Number.POSITIVE_INFINITY,
          weatherCode: Number.NaN,
          relativeHumidity: Number.NaN,
          windSpeedKmh: Number.POSITIVE_INFINITY,
          precipitationMm: Number.NEGATIVE_INFINITY,
          pressureMslHpa: Number.NaN,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getAllByText('Indisponível')).toHaveLength(6);
    expect(screen.getByText('Sensação térmica: Indisponível')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity|∞/)).not.toBeInTheDocument();
  });

  it('exibe métricas válidas junto de campos ausentes', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={{
          temperatureC: 18.5,
          apparentTemperatureC: undefined,
          weatherCode: 3,
          relativeHumidity: 70,
          windSpeedKmh: undefined,
          precipitationMm: undefined,
          pressureMslHpa: undefined,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getByText('18,5 °C')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: Indisponível')).toBeInTheDocument();
    expect(screen.getByText('Encoberto')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(3);
  });
});
