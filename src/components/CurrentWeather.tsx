import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | undefined, suffix: string, decimalPlaces = 0): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Indisponível';

  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping: false,
  }).format(value);
  return `${formatted}${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const { label, icon: WeatherIcon } = getWeatherCondition(current.weatherCode);
  const location = [city.region, city.country].filter(Boolean).join(', ');
  const metrics = [
    { label: 'Umidade', value: formatMetric(current.relativeHumidity, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, ' km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, ' mm', 1) },
    { label: 'Pressão', value: formatMetric(current.pressureMslHpa, ' hPa', 1) },
  ];

  return (
    <section
      aria-label="Clima atual"
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <h2 className="text-2xl font-semibold [overflow-wrap:anywhere]">{city.name}</h2>
      {location && <p className="text-sm text-white/70 [overflow-wrap:anywhere]">{location}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-5 sm:gap-8">
        <WeatherIcon
          aria-hidden="true"
          className="h-16 w-16 shrink-0 text-sun sm:h-20 sm:w-20"
          strokeWidth={1.5}
        />
        <div className="min-w-0">
          <p
            className={
              !Number.isFinite(current.temperatureC)
                ? 'text-2xl font-semibold sm:text-3xl [overflow-wrap:anywhere]'
                : 'text-5xl font-semibold sm:text-7xl [overflow-wrap:anywhere]'
            }
          >
            {formatTemperature(current.temperatureC, unit)}
          </p>
          <p className="mt-2 text-lg text-white/80 [overflow-wrap:anywhere]">{label}</p>
          <p className="mt-1 text-sm text-white/70 [overflow-wrap:anywhere]">
            Sensação térmica: {formatTemperature(current.apparentTemperatureC, unit)}
          </p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0">
            <dt className="text-sm text-white/70">{metric.label}</dt>
            <dd className="mt-1 font-medium [overflow-wrap:anywhere]">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
