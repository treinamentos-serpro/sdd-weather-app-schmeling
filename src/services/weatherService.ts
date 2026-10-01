import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string | null;
  country?: string | null;
}

interface ForecastResponse {
  timezone: string;
  current: {
    temperature_2m?: number | null;
    apparent_temperature?: number | null;
    relative_humidity_2m?: number | null;
    weather_code?: number | null;
    precipitation?: number | null;
    pressure_msl?: number | null;
    wind_speed_10m?: number | null;
  };
  daily: {
    time: string[];
    weather_code?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
  };
}

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    readonly kind: 'timeout' | 'network' | 'http' | 'invalid-response' = 'invalid-response',
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAbortError(error: unknown): boolean {
  return isRecord(error) && error.name === 'AbortError';
}

function isMetric(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isOptionalMetric(value: unknown): boolean {
  return value === undefined || isMetric(value);
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    Number.isFinite(value.id) &&
    typeof value.name === 'string' &&
    value.name.length > 0 &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    (value.admin1 == null || typeof value.admin1 === 'string') &&
    (value.country == null || typeof value.country === 'string')
  );
}

type RequestOperation = 'geocoding' | 'forecast';

function getOperationError(operation: RequestOperation, kind: WeatherServiceError['kind']) {
  if (kind === 'timeout') {
    const requestName = operation === 'geocoding' ? 'A busca de cidades' : 'A consulta do clima';
    return new WeatherServiceError(
      `${requestName} excedeu o limite de 10 segundos. Verifique sua conexão e tente novamente.`,
      kind,
    );
  }

  if (kind === 'network') {
    const action = operation === 'geocoding' ? 'buscar cidades' : 'carregar a previsão';
    return new WeatherServiceError(
      `Não foi possível conectar para ${action}. Verifique sua conexão com a internet e tente novamente.`,
      kind,
    );
  }

  if (kind === 'http') {
    const action = operation === 'geocoding' ? 'buscar cidades' : 'carregar a previsão';
    return new WeatherServiceError(
      `O serviço não conseguiu ${action} agora. Tente novamente em instantes.`,
      kind,
    );
  }

  const action = operation === 'geocoding' ? 'buscar cidades' : 'carregar a previsão';
  return new WeatherServiceError(
    `O serviço retornou uma resposta inválida ao ${action}. Tente novamente.`,
    kind,
  );
}

async function fetchWithTimeout(url: string, operation: RequestOperation): Promise<unknown> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(getOperationError(operation, 'timeout'));
    }, 10_000);
  });

  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw getOperationError(operation, 'http');
        }
        try {
          return (await response.json()) as unknown;
        } catch (error) {
          if (isAbortError(error)) throw error;
          throw getOperationError(operation, 'invalid-response');
        }
      })(),
      timeout,
    ]);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (isAbortError(error)) {
      throw getOperationError(operation, 'timeout');
    }
    throw getOperationError(operation, 'network');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const data = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`,
    'geocoding',
  );

  if (!isRecord(data)) {
    throw new WeatherServiceError(
      'Não foi possível interpretar a resposta de cidades. Tente novamente.',
    );
  }
  const results = data.results;
  if (results === undefined) return [];
  if (!Array.isArray(results) || !results.every(isGeocodingResult)) {
    throw new WeatherServiceError(
      'Não foi possível interpretar a resposta de cidades. Tente novamente.',
    );
  }

  const seenIds = new Set<number>();
  return results
    .filter(({ id }) => {
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    })
    .slice(0, 5)
    .map(({ id, name, latitude, longitude, admin1, country }) => ({
      id,
      name,
      latitude,
      longitude,
      region: admin1 ?? undefined,
      country: country ?? undefined,
    }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation,pressure_msl,wind_speed_10m',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });
  const payload = await fetchWithTimeout(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    'forecast',
  );
  if (!isRecord(payload) || !isRecord(payload.current) || !isRecord(payload.daily)) {
    throw new WeatherServiceError(
      'Os dados meteorológicos recebidos estão incompletos ou inválidos. Tente novamente.',
    );
  }

  const currentFields = [
    payload.current.temperature_2m,
    payload.current.apparent_temperature,
    payload.current.relative_humidity_2m,
    payload.current.weather_code,
    payload.current.precipitation,
    payload.current.pressure_msl,
    payload.current.wind_speed_10m,
  ];
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (
    typeof payload.timezone !== 'string' ||
    !payload.timezone ||
    currentFields.some((value) => !isOptionalMetric(value)) ||
    !Array.isArray(payload.daily.time) ||
    payload.daily.time.length !== 5 ||
    !payload.daily.time.every(
      (date) =>
        typeof date === 'string' &&
        datePattern.test(date) &&
        !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date,
    )
  ) {
    throw new WeatherServiceError(
      'Os dados meteorológicos recebidos estão incompletos ou inválidos. Tente novamente.',
    );
  }

  const data = payload as unknown as ForecastResponse;
  const { current, daily } = data;
  const dailyMetrics = [
    daily.weather_code,
    daily.temperature_2m_min,
    daily.temperature_2m_max,
    daily.precipitation_probability_max,
  ];
  if (
    dailyMetrics.some(
      (values) =>
        values !== undefined &&
        (!Array.isArray(values) || values.length !== 5 || !values.every(isMetric)),
    )
  ) {
    throw new WeatherServiceError(
      'Os dados meteorológicos recebidos estão incompletos ou inválidos. Tente novamente.',
    );
  }

  const currentWeather: CurrentWeather = {
    temperatureC: current.temperature_2m ?? undefined,
    apparentTemperatureC: current.apparent_temperature ?? undefined,
    weatherCode: current.weather_code ?? undefined,
    relativeHumidity: current.relative_humidity_2m ?? undefined,
    precipitationMm: current.precipitation ?? undefined,
    pressureMslHpa: current.pressure_msl ?? undefined,
    windSpeedKmh: current.wind_speed_10m ?? undefined,
  };
  const forecast: ForecastDay[] = daily.time.map((date, index) => ({
    date,
    weatherCode: daily.weather_code?.[index] ?? undefined,
    minimumTemperatureC: daily.temperature_2m_min?.[index] ?? undefined,
    maximumTemperatureC: daily.temperature_2m_max?.[index] ?? undefined,
    maximumPrecipitationProbability: daily.precipitation_probability_max?.[index] ?? undefined,
  }));

  return { city, timezone: data.timezone, current: currentWeather, forecast };
}
