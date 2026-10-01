import { act, renderHook } from '@testing-library/react';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import { mockWeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  WeatherServiceError: class WeatherServiceError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'WeatherServiceError';
    }
  },
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

const city = mockWeatherData.city;

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useWeather', () => {
  it('inicia ocioso e não consulta uma entrada em branco', async () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(async () => result.current.search('   '));
    expect(result.current.status).toBe('idle');
    expect(searchCities).not.toHaveBeenCalled();
  });

  it('apresenta cidades sem selecionar uma automaticamente', async () => {
    const otherCity = { ...city, id: 2, name: 'Outra cidade' };
    vi.mocked(searchCities).mockResolvedValue([city, otherCity]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('  São Paulo  '));

    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    expect(getWeather).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      status: 'results',
      query: 'São Paulo',
      cities: [city, otherCity],
      data: null,
      error: null,
    });

    await act(async () => result.current.selectCity(otherCity));
    expect(getWeather).toHaveBeenCalledWith(otherCity);
    expect(result.current).toMatchObject({ status: 'success', data: mockWeatherData });
  });

  it('marca como empty sem solicitar clima quando não há cidades', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Desconhecida'));

    expect(result.current).toMatchObject({ status: 'empty', query: 'Desconhecida', data: null });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('expõe loading em até 200 ms para busca e forecast', async () => {
    vi.useFakeTimers();
    let resolveCities: (cities: (typeof city)[]) => void = () => {};
    let resolveWeather: (data: typeof mockWeatherData) => void = () => {};
    vi.mocked(searchCities).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCities = resolve;
        }),
    );
    vi.mocked(getWeather).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveWeather = resolve;
        }),
    );
    const { result } = renderHook(() => useWeather());

    const searchStartedAt = Date.now();
    let searchPromise: Promise<void> = Promise.resolve();
    act(() => {
      searchPromise = result.current.search('São Paulo');
    });
    await vi.advanceTimersByTimeAsync(200);
    expect(Date.now() - searchStartedAt).toBeLessThanOrEqual(200);
    expect(result.current.status).toBe('loading');

    await act(async () => {
      resolveCities([city]);
      await searchPromise;
    });
    expect(result.current.status).toBe('results');

    const weatherStartedAt = Date.now();
    let weatherPromise: Promise<void> = Promise.resolve();
    act(() => {
      weatherPromise = result.current.selectCity(city);
    });
    await vi.advanceTimersByTimeAsync(200);
    expect(Date.now() - weatherStartedAt).toBeLessThanOrEqual(200);
    expect(result.current.status).toBe('loading');

    await act(async () => {
      resolveWeather(mockWeatherData);
      await weatherPromise;
    });
    expect(result.current.status).toBe('success');
  });

  it('repete a busca após erro no geocoding', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new Error('Falha de rede.'))
      .mockResolvedValueOnce([city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('São Paulo'));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'Não foi possível buscar cidades. Verifique sua conexão e tente novamente.',
      data: null,
    });

    await act(async () => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenNthCalledWith(2, 'São Paulo');
    expect(getWeather).not.toHaveBeenCalled();
    expect(result.current.status).toBe('results');
    await act(async () => result.current.selectCity(city));
    expect(getWeather).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('success');
  });

  it('repete apenas o forecast após erro ao selecionar uma cidade', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error('Previsão indisponível.'))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('São Paulo'));
    await act(async () => result.current.selectCity(city));
    expect(result.current).toMatchObject({
      status: 'error',
      cities: [],
      data: null,
      error: 'Não foi possível carregar a previsão. Verifique sua conexão e tente novamente.',
    });

    await act(async () => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenNthCalledWith(2, city);
    expect(result.current.status).toBe('success');
  });

  it('limpa os dados anteriores ao selecionar outra cidade', async () => {
    const otherCity = { ...city, id: 2, name: 'Outra cidade' };
    let resolveWeather: (data: typeof mockWeatherData) => void = () => {};
    vi.mocked(searchCities).mockResolvedValue([city, otherCity]);
    vi.mocked(getWeather)
      .mockResolvedValueOnce(mockWeatherData)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveWeather = resolve;
          }),
      );
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('São Paulo'));
    await act(async () => result.current.selectCity(city));
    act(() => {
      void result.current.selectCity(otherCity);
    });

    expect(result.current).toMatchObject({
      status: 'loading',
      data: null,
      cities: [],
    });
    await act(async () => resolveWeather({ ...mockWeatherData, city: otherCity }));
    expect(result.current).toMatchObject({ status: 'success', data: { city: otherCity } });
  });

  it('ignora forecast de A que termina depois do forecast de B', async () => {
    const secondCity = { ...city, id: 2, name: 'Curitiba' };
    const secondWeather = {
      ...mockWeatherData,
      city: secondCity,
      current: { ...mockWeatherData.current, temperatureC: 21.5 },
    };
    let resolveFirst: (data: typeof mockWeatherData) => void = () => {};
    let resolveSecond: (data: typeof mockWeatherData) => void = () => {};
    vi.mocked(getWeather)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
      );
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.selectCity(city);
    });
    act(() => {
      void result.current.selectCity(secondCity);
    });
    await act(async () => resolveSecond(secondWeather));
    await act(async () => resolveFirst(mockWeatherData));

    expect(result.current).toMatchObject({
      status: 'success',
      data: { city: secondCity, current: { temperatureC: 21.5 } },
    });
  });

  it('ignora geocoding de uma busca substituída', async () => {
    let resolveOld: (cities: (typeof city)[]) => void = () => {};
    vi.mocked(searchCities)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValueOnce([]);
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.search('Antiga');
    });
    await act(async () => result.current.search('Nova'));
    await act(async () => resolveOld([city]));

    expect(result.current).toMatchObject({ status: 'empty', query: 'Nova', cities: [] });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('ignora previsão antiga após iniciar uma nova busca', async () => {
    let resolveWeather: (data: typeof mockWeatherData) => void = () => {};
    vi.mocked(searchCities).mockResolvedValueOnce([city]).mockResolvedValueOnce([]);
    vi.mocked(getWeather).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveWeather = resolve;
        }),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Antiga'));
    act(() => {
      void result.current.selectCity(city);
    });
    await act(async () => result.current.search('Nova'));
    await act(async () => resolveWeather(mockWeatherData));

    expect(result.current).toMatchObject({ status: 'empty', query: 'Nova', data: null });
  });
});
