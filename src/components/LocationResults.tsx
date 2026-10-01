import type { City } from '../types/weather';

interface LocationResultsProps {
  cities: City[];
  activeIndex: number | null;
  onActiveIndexChange: (index: number) => void;
  onSelect: (city: City) => void;
}

export default function LocationResults({
  cities,
  activeIndex,
  onActiveIndexChange,
  onSelect,
}: LocationResultsProps) {
  const results = cities.slice(0, 5);

  return (
    <div
      id="city-search-results"
      role="listbox"
      aria-label="Cidades encontradas"
      className="mt-2 overflow-hidden rounded-md border border-white/40 bg-night-800 shadow-glass"
    >
      {results.map((city, index) => {
        const location = [city.region, city.country].filter(Boolean).join(', ');

        return (
          <button
            key={city.id}
            type="button"
            id={`city-option-${city.id}`}
            role="option"
            tabIndex={-1}
            aria-selected={activeIndex === index}
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={() => onActiveIndexChange(index)}
            onClick={() => onSelect(city)}
            className="block w-full cursor-pointer px-4 py-3 text-left text-white aria-selected:bg-accent-600 hover:bg-white/10 aria-selected:hover:bg-accent-600"
          >
            <span className="block font-medium [overflow-wrap:anywhere]">{city.name}</span>
            {location && (
              <span className="block text-sm text-white/80 [overflow-wrap:anywhere]">
                {location}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
