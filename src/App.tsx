import { CloudSun } from 'lucide-react';
import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const { status, data, cities, error, query, search, selectCity, retry, dismissSearchResults } =
    useWeather();
  const [unit, setUnit] = useState<Unit>('celsius');
  const announcement =
    status === 'empty'
      ? `Nenhuma cidade encontrada para ${query}.`
      : status === 'results' && cities.length > 0
        ? `${cities.length} ${cities.length === 1 ? 'cidade encontrada' : 'cidades encontradas'}.`
        : status === 'success' && data
          ? `Clima carregado para ${data.city.name}.`
          : '';

  return (
    <div className="min-h-screen bg-night-900 font-sans text-white">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:m-2 focus:rounded-md focus:bg-night-900 focus:p-3 focus:text-white focus:outline focus:outline-2 focus:outline-accent-400"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-white/10 bg-night-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:gap-8">
          <div className="flex shrink-0 items-center gap-3 lg:pb-3">
            <CloudSun aria-hidden="true" className="h-9 w-9 text-sun" strokeWidth={1.5} />
            <h1 className="text-xl font-semibold">Tempo Agora</h1>
          </div>
          <div className="min-w-0 flex-1">
            <SearchBar
              onSearch={search}
              activeQuery={query}
              cities={cities}
              onSelectCity={selectCity}
              onDismissResults={dismissSearchResults}
            />
          </div>
          <div className="self-start lg:pb-2">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
      >
        {status === 'loading' && <LoadingState message={`Buscando ${query}...`} />}
        <div aria-busy={status === 'loading'}>
          {status === 'idle' && (
            <div className="space-y-4">
              <EmptyState title="Nenhuma cidade selecionada" hint="São Paulo, Brasil" />
              <button
                type="button"
                onClick={() => void search('São Paulo')}
                className="rounded-md bg-accent-600 px-4 py-2 font-medium text-white transition-colors hover:bg-accent-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
              >
                Ver São Paulo
              </button>
            </div>
          )}
          {status === 'empty' && (
            <EmptyState
              title="Nenhuma cidade encontrada"
              hint={`Não encontramos dados para ${query}.`}
            />
          )}
          {status === 'error' && (
            <ErrorState message={error ?? 'Não foi possível consultar o clima.'} onRetry={retry} />
          )}
          {status === 'success' && data && (
            <div className="space-y-8">
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
              <p className="border-t border-white/10 pt-5 text-sm text-white/70">
                Este app não fornece alertas meteorológicos severos. Consulte os serviços oficiais
                da sua região para avisos.
              </p>
            </div>
          )}
        </div>
      </main>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  );
}
