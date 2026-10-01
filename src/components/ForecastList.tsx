import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-label="Previsão de 5 dias" className="text-white">
      <h2 className="mb-4 text-xl font-semibold">Próximos dias</h2>
      {forecast.length === 0 ? (
        <p className="text-white/70">Previsão indisponível.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.map((day) => (
            <li key={day.date}>
              <ForecastCard day={day} unit={unit} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
