import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

type Status = 'idle' | 'loading' | 'results' | 'success' | 'error' | 'empty';
type Operation = { type: 'search'; query: string } | { type: 'weather'; city: City };

interface WeatherView {
  status: Status;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

const initialView: WeatherView = {
  status: 'idle',
  data: null,
  cities: [],
  error: null,
  query: '',
};

function getFriendlyError(error: unknown, fallback: string): string {
  return error instanceof WeatherServiceError ? error.message : fallback;
}

export function useWeather() {
  const [view, setView] = useState<WeatherView>(initialView);
  const requestId = useRef(0);
  const lastOperation = useRef<Operation | null>(null);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  async function selectCity(city: City): Promise<void> {
    const currentRequest = ++requestId.current;
    lastOperation.current = { type: 'weather', city };
    setView((previous) => ({
      ...previous,
      status: 'loading',
      cities: [],
      data: null,
      error: null,
    }));

    try {
      const data = await getWeather(city);
      if (currentRequest !== requestId.current) return;
      setView((previous) => ({ ...previous, status: 'success', data }));
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setView((previous) => ({
        ...previous,
        status: 'error',
        error: getFriendlyError(
          error,
          'Não foi possível carregar a previsão. Verifique sua conexão e tente novamente.',
        ),
      }));
    }
  }

  async function search(name: string): Promise<void> {
    const query = name.trim();
    const currentRequest = ++requestId.current;
    lastOperation.current = query ? { type: 'search', query } : null;
    setView({ ...initialView, status: query ? 'loading' : 'idle', query });
    if (!query) return;

    try {
      const cities = await searchCities(query);
      if (currentRequest !== requestId.current) return;
      if (cities.length === 0) {
        setView({ ...initialView, status: 'empty', query });
        return;
      }
      setView((previous) => ({
        ...previous,
        status: 'results',
        cities,
        data: null,
        error: null,
      }));
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setView((previous) => ({
        ...previous,
        status: 'error',
        error: getFriendlyError(
          error,
          'Não foi possível buscar cidades. Verifique sua conexão e tente novamente.',
        ),
      }));
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (operation?.type === 'search') await search(operation.query);
    if (operation?.type === 'weather') await selectCity(operation.city);
  }

  function dismissSearchResults(): void {
    setView((previous) => ({ ...previous, cities: [] }));
  }

  return { ...view, search, selectCity, retry, dismissSearchResults };
}
