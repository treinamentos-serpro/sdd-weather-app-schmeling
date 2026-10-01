export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  country?: string;
}

export interface CurrentWeather {
  temperatureC: number | undefined;
  apparentTemperatureC: number | undefined;
  weatherCode: number | undefined;
  relativeHumidity: number | undefined;
  precipitationMm: number | undefined;
  pressureMslHpa: number | undefined;
  windSpeedKmh: number | undefined;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | undefined;
  minimumTemperatureC: number | undefined;
  maximumTemperatureC: number | undefined;
  maximumPrecipitationProbability: number | undefined;
}

export interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    latitude: -23.5475,
    longitude: -46.6361,
    region: 'São Paulo',
    country: 'Brasil',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 18.5,
    apparentTemperatureC: 17.2,
    weatherCode: 3,
    relativeHumidity: 70,
    precipitationMm: 0.2,
    pressureMslHpa: 1013.2,
    windSpeedKmh: 10,
  },
  forecast: [
    {
      date: '2026-09-30',
      weatherCode: 3,
      minimumTemperatureC: 15.2,
      maximumTemperatureC: 23.8,
      maximumPrecipitationProbability: 20,
    },
    {
      date: '2026-10-01',
      weatherCode: 2,
      minimumTemperatureC: 16.1,
      maximumTemperatureC: 25.4,
      maximumPrecipitationProbability: 10,
    },
    {
      date: '2026-10-02',
      weatherCode: 61,
      minimumTemperatureC: 17.3,
      maximumTemperatureC: 22.6,
      maximumPrecipitationProbability: 75,
    },
    {
      date: '2026-10-03',
      weatherCode: 80,
      minimumTemperatureC: 16.8,
      maximumTemperatureC: 21.9,
      maximumPrecipitationProbability: 60,
    },
    {
      date: '2026-10-04',
      weatherCode: 1,
      minimumTemperatureC: 15.5,
      maximumTemperatureC: 26.2,
      maximumPrecipitationProbability: 5,
    },
  ],
};

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; cities: City[] }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; message: string };

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading'; city: City }
  | { status: 'success'; data: WeatherData }
  | { status: 'error'; city: City; message: string };
