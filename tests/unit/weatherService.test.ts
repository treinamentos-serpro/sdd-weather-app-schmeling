import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('retorna vazio sem chamar a rede para uma busca em branco', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o nome e mapeia os resultados para cidades', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            name: 'São José',
            latitude: -23.2,
            longitude: -45.9,
            admin1: 'São Paulo',
            country: 'Brasil',
          },
          { id: 2, name: 'São José', latitude: -27.6, longitude: -48.6 },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities("  São José d'Oeste  ")).resolves.toEqual([
      {
        id: 1,
        name: 'São José',
        latitude: -23.2,
        longitude: -45.9,
        region: 'São Paulo',
        country: 'Brasil',
      },
      {
        id: 2,
        name: 'São José',
        latitude: -27.6,
        longitude: -48.6,
        region: undefined,
        country: undefined,
      },
    ]);
    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get('name')).toBe("São José d'Oeste");
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      name: "São José d'Oeste",
      count: '5',
      language: 'pt',
      format: 'json',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toEqual({ signal: expect.any(AbortSignal) });
  });

  it('retorna vazio quando a API não encontra resultados', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

    await expect(searchCities('Inexistente')).resolves.toEqual([]);
  });

  it('normaliza região e país nulos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { id: 1, name: 'Cidade', latitude: 1, longitude: 2, admin1: null, country: null },
          ],
        }),
      }),
    );

    await expect(searchCities('Cidade')).resolves.toEqual([
      { id: 1, name: 'Cidade', latitude: 1, longitude: 2, region: undefined, country: undefined },
    ]);
  });

  it('remove IDs duplicados mantendo a primeira ocorrência e limita a cinco cidades', async () => {
    const results = Array.from({ length: 6 }, (_, index) => ({
      id: index + 1,
      name: `Cidade ${index + 1}`,
      latitude: index,
      longitude: index + 1,
    }));
    results.splice(1, 0, { ...results[0], name: 'Nome duplicado' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results }) }),
    );

    const cities = await searchCities('Cidade');

    expect(cities).toHaveLength(5);
    expect(cities.map(({ id, name }) => [id, name])).toEqual([
      [1, 'Cidade 1'],
      [2, 'Cidade 2'],
      [3, 'Cidade 3'],
      [4, 'Cidade 4'],
      [5, 'Cidade 5'],
    ]);
  });

  it.each([
    { results: null },
    { results: 'invalid' },
    { results: [{ id: 1 }] },
  ])('rejeita geocoding malformado: %j', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível interpretar a resposta de cidades. Tente novamente.',
    });
  });

  it('lança WeatherServiceError em resposta HTTP não-ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

describe('getWeather', () => {
  const city: City = { id: 1, name: 'São Paulo', latitude: -23.55, longitude: -46.63 };

  it('preserva o erro HTTP de forecast como WeatherServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'O serviço não conseguiu carregar a previsão agora. Tente novamente em instantes.',
      kind: 'http',
    });
  });

  it('solicita current e daily e preserva a associação entre os cinco dias', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: {
          temperature_2m: 18.5,
          apparent_temperature: 17.2,
          relative_humidity_2m: 70,
          weather_code: 3,
          precipitation: 0.2,
          pressure_msl: 1013.2,
          wind_speed_10m: 10,
        },
        daily: {
          time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
          weather_code: [3, 2, 61, 1, 0],
          temperature_2m_min: [14, 15, 13, 16, 17],
          temperature_2m_max: [22, 24, 20, 23, 25],
          precipitation_probability_max: [10, 20, 80, 15, 0],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: '-23.55',
      longitude: '-46.63',
      current:
        'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation,pressure_msl,wind_speed_10m',
      daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '5',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      precipitation_unit: 'mm',
    });
    expect(result).toEqual({
      city,
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
          minimumTemperatureC: 14,
          maximumTemperatureC: 22,
          maximumPrecipitationProbability: 10,
        },
        {
          date: '2026-10-01',
          weatherCode: 2,
          minimumTemperatureC: 15,
          maximumTemperatureC: 24,
          maximumPrecipitationProbability: 20,
        },
        {
          date: '2026-10-02',
          weatherCode: 61,
          minimumTemperatureC: 13,
          maximumTemperatureC: 20,
          maximumPrecipitationProbability: 80,
        },
        {
          date: '2026-10-03',
          weatherCode: 1,
          minimumTemperatureC: 16,
          maximumTemperatureC: 23,
          maximumPrecipitationProbability: 15,
        },
        {
          date: '2026-10-04',
          weatherCode: 0,
          minimumTemperatureC: 17,
          maximumTemperatureC: 25,
          maximumPrecipitationProbability: 0,
        },
      ],
    });
  });

  it('normaliza precipitação atual nula como indisponível', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: 'America/Sao_Paulo',
          current: { precipitation: null },
          daily: {
            time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
          },
        }),
      }),
    );

    await expect(getWeather(city)).resolves.toMatchObject({
      current: { precipitationMm: undefined },
      forecast: expect.arrayContaining([expect.objectContaining({ date: '2026-09-30' })]),
    });
  });

  it('normaliza métricas nulas de current e daily sem perder as datas', async () => {
    const dates = ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: 'America/Sao_Paulo',
          current: {
            temperature_2m: null,
            apparent_temperature: null,
            relative_humidity_2m: null,
            weather_code: null,
            precipitation: null,
            pressure_msl: null,
            wind_speed_10m: null,
          },
          daily: {
            time: dates,
            weather_code: Array(5).fill(null),
            temperature_2m_min: Array(5).fill(null),
            temperature_2m_max: Array(5).fill(null),
            precipitation_probability_max: Array(5).fill(null),
          },
        }),
      }),
    );

    const result = await getWeather(city);

    expect(result.current).toEqual({
      temperatureC: undefined,
      apparentTemperatureC: undefined,
      weatherCode: undefined,
      relativeHumidity: undefined,
      precipitationMm: undefined,
      pressureMslHpa: undefined,
      windSpeedKmh: undefined,
    });
    expect(result.forecast[0]).toEqual({
      date: dates[0],
      weatherCode: undefined,
      minimumTemperatureC: undefined,
      maximumTemperatureC: undefined,
      maximumPrecipitationProbability: undefined,
    });
  });

  it.each([
    { timezone: 'America/Sao_Paulo', daily: { time: [] } },
    { timezone: 'America/Sao_Paulo', current: {} },
  ])('rejeita resposta sem current ou daily: %j', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('rejeita arrays diários desalinhados', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: 'America/Sao_Paulo',
          current: {},
          daily: {
            time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
            weather_code: [3],
          },
        }),
      }),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([
    { timezone: null, current: {}, daily: { time: Array(5).fill('2026-09-30') } },
    {
      timezone: 'America/Sao_Paulo',
      current: { temperature_2m: '18' },
      daily: { time: Array(5).fill('2026-09-30') },
    },
    { timezone: 'America/Sao_Paulo', current: {}, daily: { time: Array(5).fill('data inválida') } },
    {
      timezone: 'America/Sao_Paulo',
      current: {},
      daily: { time: ['2026-09-30', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03'] },
    },
    {
      timezone: 'America/Sao_Paulo',
      current: {},
      daily: { time: ['2026-09-30', '2026-10-01', '2026-10-03', '2026-10-04', '2026-10-05'] },
    },
  ])('rejeita forecast com tipos incompatíveis: %j', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([
    {
      current: { relative_humidity_2m: -1 },
      daily: { time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'] },
    },
    {
      current: { relative_humidity_2m: 101 },
      daily: { time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'] },
    },
    {
      current: {},
      daily: {
        time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
        precipitation_probability_max: [-1, 0, 0, 0, 0],
      },
    },
    {
      current: {},
      daily: {
        time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
        precipitation_probability_max: [101, 0, 0, 0, 0],
      },
    },
  ])('rejeita percentuais fora do intervalo de 0 a 100: %j', async ({ current, daily }) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ timezone: 'America/Sao_Paulo', current, daily }),
      }),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('aceita percentuais nos limites de 0 e 100', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: 'America/Sao_Paulo',
          current: { relative_humidity_2m: 0 },
          daily: {
            time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
            precipitation_probability_max: [0, 100, 50, null, 0],
          },
        }),
      }),
    );

    const result = await getWeather(city);

    expect(result.current.relativeHumidity).toBe(0);
    expect(
      result.forecast.map(({ maximumPrecipitationProbability }) => maximumPrecipitationProbability),
    ).toEqual([0, 100, 50, undefined, 0]);
  });

  it('normaliza métricas ausentes ou nulas sem descartar datas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: 'America/Sao_Paulo',
          current: { temperature_2m: null },
          daily: {
            time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
            weather_code: [null, 0, 1, 2, 3],
          },
        }),
      }),
    );

    const result = await getWeather(city);

    expect(result.current.temperatureC).toBeUndefined();
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toEqual({
      date: '2026-09-30',
      weatherCode: undefined,
      minimumTemperatureC: undefined,
      maximumTemperatureC: undefined,
      maximumPrecipitationProbability: undefined,
    });
    expect(result.forecast[1].weatherCode).toBe(0);
  });

  it('preserva cada métrica válida ao lado de campos ausentes na resposta parcial', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: 'America/Sao_Paulo',
          current: {
            temperature_2m: 18.5,
            apparent_temperature: null,
            relative_humidity_2m: 70,
          },
          daily: {
            time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
            weather_code: [3, null, 61, 1, 0],
            temperature_2m_min: [14, null, 13, 16, 17],
            temperature_2m_max: [22, 24, 20, 23, 25],
          },
        }),
      }),
    );

    const result = await getWeather(city);

    expect(result.current).toMatchObject({
      temperatureC: 18.5,
      apparentTemperatureC: undefined,
      relativeHumidity: 70,
      precipitationMm: undefined,
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toMatchObject({
      date: '2026-09-30',
      weatherCode: 3,
      minimumTemperatureC: 14,
      maximumTemperatureC: 22,
      maximumPrecipitationProbability: undefined,
    });
    expect(result.forecast[1]).toMatchObject({
      date: '2026-10-01',
      weatherCode: undefined,
      minimumTemperatureC: undefined,
      maximumTemperatureC: 24,
      maximumPrecipitationProbability: undefined,
    });
  });
});

describe('fetchWithTimeout', () => {
  const city: City = { id: 1, name: 'São Paulo', latitude: -23.55, longitude: -46.63 };
  const requests = [
    [
      'geocoding',
      () => searchCities('São Paulo'),
      'A busca de cidades excedeu o limite de 10 segundos. Verifique sua conexão e tente novamente.',
      'Não foi possível conectar para buscar cidades. Verifique sua conexão com a internet e tente novamente.',
      'O serviço retornou uma resposta inválida ao buscar cidades. Tente novamente.',
    ],
    [
      'forecast',
      () => getWeather(city),
      'A consulta do clima excedeu o limite de 10 segundos. Verifique sua conexão e tente novamente.',
      'Não foi possível conectar para carregar a previsão. Verifique sua conexão com a internet e tente novamente.',
      'O serviço retornou uma resposta inválida ao carregar a previsão. Tente novamente.',
    ],
  ] as const;

  it('limpa o timer após resposta bem-sucedida', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

    await searchCities('São Paulo');

    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(
    requests,
  )('aborta %s após 10 segundos com orientação clara e limpa o timer', async (_, request, timeoutMessage) => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation(
      (_url: string, options: RequestInit) =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const pending = request();
    const rejection = expect(pending).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: timeoutMessage,
    });
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    await vi.advanceTimersByTimeAsync(9_999);
    expect(signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    expect(signal.aborted).toBe(true);
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(
    requests,
  )('exibe orientação amigável se %s estiver offline e limpa o timer', async (_, request, _timeoutMessage, networkMessage) => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(request()).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: networkMessage,
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(
    requests,
  )('explica quando %s retorna JSON inválido e limpa o timer', async (_, request, _timeoutMessage, _networkMessage, invalidResponseMessage) => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      }),
    );

    await expect(request()).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
      message: invalidResponseMessage,
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(
    requests,
  )('limita %s a 10 segundos mesmo se o corpo JSON não terminar', async (_, request, timeoutMessage) => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => new Promise(() => {}),
      }),
    );

    const pending = request();
    const rejection = expect(pending).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: timeoutMessage,
    });
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });
});
