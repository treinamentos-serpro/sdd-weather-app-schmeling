import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import type { City } from '../types/weather';
import LocationResults from './LocationResults';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
  activeQuery?: string;
  cities?: City[];
  onSelectCity?: (city: City) => void;
  onDismissResults?: () => void;
}

export default function SearchBar({
  onSearch,
  disabled = false,
  activeQuery = '',
  cities = [],
  onSelectCity,
  onDismissResults,
}: SearchBarProps) {
  const [city, setCity] = useState(activeQuery);
  const [showEmptyError, setShowEmptyError] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleCities = onSelectCity ? cities.slice(0, 5) : [];
  const activeCity = activeIndex === null ? undefined : visibleCities[activeIndex];

  useEffect(() => {
    setCity(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    if (visibleCities.length > 0) inputRef.current?.focus();
  }, [visibleCities.length]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = city.trim();

    if (!query) {
      setShowEmptyError(true);
      inputRef.current?.focus();
      return;
    }

    setShowEmptyError(false);
    setActiveIndex(null);
    onDismissResults?.();
    onSearch(query);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (visibleCities.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) =>
        current === null ? 0 : Math.min(current + 1, visibleCities.length - 1),
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        current === null ? visibleCities.length - 1 : Math.max(current - 1, 0),
      );
    } else if (event.key === 'Enter' && activeIndex !== null) {
      event.preventDefault();
      if (activeCity) onSelectCity?.(activeCity);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setActiveIndex(null);
      onDismissResults?.();
    }
  }

  return (
    <div>
      <form role="search" onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="city-search" className="block text-sm font-medium text-white">
          Cidade
        </label>
        <div className="flex gap-2 rounded-lg border border-white/40 bg-white/5 p-2 shadow-glass backdrop-blur-md focus-within:border-accent-400">
          <input
            ref={inputRef}
            id="city-search"
            type="text"
            role="combobox"
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              setShowEmptyError(false);
              setActiveIndex(null);
              if (cities.length > 0) onDismissResults?.();
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-autocomplete="list"
            aria-expanded={visibleCities.length > 0}
            aria-controls={visibleCities.length > 0 ? 'city-search-results' : undefined}
            aria-activedescendant={activeCity ? `city-option-${activeCity.id}` : undefined}
            aria-invalid={showEmptyError}
            aria-describedby={showEmptyError ? 'city-search-error' : undefined}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-white outline-none placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-accent-400 disabled:opacity-50"
            placeholder="Digite uma cidade"
          />
          <button
            type="submit"
            disabled={disabled}
            className="shrink-0 cursor-pointer rounded-md bg-accent-600 px-4 py-2 font-medium text-white transition-colors hover:bg-accent-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent-600"
          >
            Buscar
          </button>
        </div>
        {showEmptyError && (
          <p id="city-search-error" role="alert" className="text-sm text-sun">
            Informe o nome da cidade.
          </p>
        )}
      </form>
      {visibleCities.length > 0 && (
        <LocationResults
          cities={visibleCities}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onSelect={(selectedCity) => onSelectCity?.(selectedCity)}
        />
      )}
    </div>
  );
}
