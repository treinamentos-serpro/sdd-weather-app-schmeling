import { formatDay } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

const probabilityFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  useGrouping: false,
});

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const { label, icon: WeatherIcon } = getWeatherCondition(day.weatherCode);
  const precipitationProbability = day.maximumPrecipitationProbability;
  const precipitation =
    typeof precipitationProbability !== 'number' || !Number.isFinite(precipitationProbability)
      ? 'Indisponível'
      : `${probabilityFormatter.format(precipitationProbability)}%`;

  return (
    <article className="h-full min-w-0 rounded-md border border-white/10 bg-white/5 p-3 text-white backdrop-blur-md sm:p-4">
      <time
        dateTime={day.date}
        className="block text-sm font-semibold capitalize text-white/90 [overflow-wrap:anywhere]"
      >
        {formatDay(day.date)}
      </time>
      <WeatherIcon aria-hidden="true" className="my-3 h-9 w-9 text-sun" strokeWidth={1.5} />
      <p className="min-h-10 text-sm text-white/80 [overflow-wrap:anywhere]">{label}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <dt className="text-white/70">Máx.</dt>
          <dd className="min-w-0 font-medium [overflow-wrap:anywhere]">
            {formatTemperature(day.maximumTemperatureC, unit)}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <dt className="text-white/70">Mín.</dt>
          <dd className="min-w-0 font-medium [overflow-wrap:anywhere]">
            {formatTemperature(day.minimumTemperatureC, unit)}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <dt className="text-white/70">Chuva</dt>
          <dd className="min-w-0 font-medium [overflow-wrap:anywhere]">{precipitation}</dd>
        </div>
      </dl>
    </article>
  );
}
