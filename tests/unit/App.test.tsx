import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { getWeather, searchCities } from '../../src/services/weatherService';
import { type City, mockWeatherData, type WeatherData } from '../../src/types/weather';

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

beforeEach(() => {
  vi.resetAllMocks();
});

describe('App', () => {
  it('oferece título principal e acesso direto ao conteúdo', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Tempo Agora' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute(
      'href',
      '#conteudo',
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo');
  });

  it('passa de idle para loading e apresenta a previsão com temperaturas convertidas', async () => {
    let resolveWeather: (data: WeatherData) => void = () => {};
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockImplementation(
      () =>
        new Promise<WeatherData>((resolve) => {
          resolveWeather = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Nenhuma cidade selecionada' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Clima atual' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver São Paulo' }));
    await user.click(await screen.findByRole('option', { name: /São Paulo/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Buscando São Paulo...');
    expect(screen.getByRole('main').querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Cidade' })).toBeEnabled();
    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    await waitFor(() => expect(getWeather).toHaveBeenCalledWith(mockWeatherData.city));

    await act(async () => resolveWeather(mockWeatherData));
    expect(screen.getByRole('main').querySelector('[aria-busy="false"]')).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Clima atual' })).toHaveTextContent('18,5 °C');
    expect(screen.getByText('Clima carregado para São Paulo.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Previsão de 5 dias' })).toHaveTextContent('23,8 °C');
    expect(
      screen.getByText(
        'Este app não fornece alertas meteorológicos severos. Consulte os serviços oficiais da sua região para avisos.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByRole('region', { name: 'Clima atual' })).toHaveTextContent('65,3 °F');
    expect(screen.getByRole('region', { name: 'Previsão de 5 dias' })).toHaveTextContent('74,8 °F');
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('mantém o foco no combobox após resultados chegarem pelo botão Buscar', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    await user.type(input, 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('listbox', { name: 'Cidades encontradas' });

    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('informa quando não há cidades e não mantém métricas antigas', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockImplementation(async (query: string) =>
      query === 'São Paulo' ? [mockWeatherData.city] : [],
    );
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Ver São Paulo' }));
    await user.click(await screen.findByRole('option', { name: /São Paulo/ }));
    expect(await screen.findByRole('region', { name: 'Clima atual' })).toBeInTheDocument();

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    expect(input).toHaveValue('São Paulo');
    await user.clear(input);
    await user.type(input, 'Rio de Janeiro{Enter}');
    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Clima atual' })).not.toBeInTheDocument();
    expect(screen.getByText('Não encontramos dados para Rio de Janeiro.')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma cidade encontrada para Rio de Janeiro.')).toBeInTheDocument();
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Rio de Janeiro');
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('substitui os dados da cidade A por B e não mostra A durante o loading de B', async () => {
    const secondCity: City = {
      ...mockWeatherData.city,
      id: 2,
      name: 'Curitiba',
      region: 'Paraná',
    };
    const secondWeather: WeatherData = {
      ...mockWeatherData,
      city: secondCity,
      current: { ...mockWeatherData.current, temperatureC: 21.5 },
    };
    let resolveSecondWeather: (data: WeatherData) => void = () => {};
    vi.mocked(searchCities).mockImplementation(async (query: string) =>
      query === 'São Paulo' ? [mockWeatherData.city] : [secondCity],
    );
    vi.mocked(getWeather)
      .mockResolvedValueOnce(mockWeatherData)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecondWeather = resolve;
          }),
      );
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    await user.type(input, 'São Paulo{Enter}');
    await user.click(await screen.findByRole('option', { name: /São Paulo/ }));
    expect(await screen.findByRole('region', { name: 'Clima atual' })).toHaveTextContent('18,5 °C');

    await user.clear(input);
    await user.type(input, 'Curitiba{Enter}');
    await user.click(await screen.findByRole('option', { name: /Curitiba/ }));

    expect(screen.getByRole('status')).toHaveTextContent('Buscando Curitiba...');
    expect(screen.queryByRole('region', { name: 'Clima atual' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Previsão de 5 dias' })).not.toBeInTheDocument();

    await act(async () => resolveSecondWeather(secondWeather));

    const currentWeather = await screen.findByRole('region', { name: 'Clima atual' });
    expect(currentWeather).toHaveTextContent('Curitiba');
    expect(currentWeather).toHaveTextContent('21,5 °C');
    expect(currentWeather).not.toHaveTextContent('São Paulo');
    expect(getWeather).toHaveBeenNthCalledWith(1, mockWeatherData.city);
    expect(getWeather).toHaveBeenNthCalledWith(2, secondCity);
  });

  it('apresenta como indisponíveis os campos omitidos no forecast', async () => {
    const partialWeather: WeatherData = {
      ...mockWeatherData,
      current: { ...mockWeatherData.current, apparentTemperatureC: undefined },
      forecast: mockWeatherData.forecast.map((day, index) =>
        index === 0
          ? {
              ...day,
              maximumTemperatureC: undefined,
              maximumPrecipitationProbability: undefined,
            }
          : day,
      ),
    };
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(partialWeather);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Ver São Paulo' }));
    await user.click(await screen.findByRole('option', { name: /São Paulo/ }));

    const currentWeather = await screen.findByRole('region', { name: 'Clima atual' });
    expect(within(currentWeather).getByText('18,5 °C')).toBeInTheDocument();
    expect(within(currentWeather).getByText('Sensação térmica: Indisponível')).toBeInTheDocument();

    const firstForecastDay = within(
      screen.getByRole('region', { name: 'Previsão de 5 dias' }),
    ).getAllByRole('listitem')[0];
    expect(within(firstForecastDay).getByText('15,2 °C')).toBeInTheDocument();
    expect(within(firstForecastDay).getAllByText('Indisponível')).toHaveLength(2);
  });

  it('mostra erro e repete a mesma consulta no retry', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Ver São Paulo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível buscar cidades. Verifique sua conexão e tente novamente.',
    );
    expect(screen.queryByRole('region', { name: 'Clima atual' })).not.toBeInTheDocument();

    await user.click(
      within(screen.getByRole('alert')).getByRole('button', { name: 'Tentar novamente' }),
    );
    await user.click(await screen.findByRole('option', { name: /São Paulo/ }));
    expect(await screen.findByRole('region', { name: 'Clima atual' })).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenNthCalledWith(2, 'São Paulo');
  });

  it('refaz apenas a previsão ao tentar novamente depois de erro no clima', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Ver São Paulo' }));
    await user.click(await screen.findByRole('option', { name: /São Paulo/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a previsão. Verifique sua conexão e tente novamente.',
    );

    await user.click(
      within(screen.getByRole('alert')).getByRole('button', { name: 'Tentar novamente' }),
    );
    expect(await screen.findByRole('region', { name: 'Clima atual' })).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('mantém o alerta e a ação de retry quando a nova consulta também falha', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error('Falha inicial.'))
      .mockRejectedValueOnce(new Error('Falha novamente.'));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Ver São Paulo' }));
    await user.click(await screen.findByRole('option', { name: /São Paulo/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a previsão. Verifique sua conexão e tente novamente.',
    );

    const retry = within(screen.getByRole('alert')).getByRole('button', {
      name: 'Tentar novamente',
    });
    retry.focus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a previsão. Verifique sua conexão e tente novamente.',
    );
    expect(
      within(screen.getByRole('alert')).getByRole('button', { name: 'Tentar novamente' }),
    ).toBeVisible();
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('mantém o foco na busca durante loading e descarta uma resposta antiga', async () => {
    const pending = new Map<string, (cities: City[]) => void>();
    vi.mocked(searchCities).mockImplementation(
      (query: string) => new Promise<City[]>((resolve) => pending.set(query, resolve)),
    );
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    await user.type(input, 'São Paulo{Enter}');
    expect(input).toHaveFocus();
    expect(input).toBeEnabled();

    await user.clear(input);
    await user.type(input, 'Rio de Janeiro{Enter}');
    expect(searchCities).toHaveBeenCalledTimes(2);

    await act(async () => pending.get('Rio de Janeiro')?.([]));
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();

    await act(async () => pending.get('São Paulo')?.([mockWeatherData.city]));
    expect(screen.queryByRole('region', { name: 'Clima atual' })).not.toBeInTheDocument();
    expect(screen.getByText('Não encontramos dados para Rio de Janeiro.')).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('navega pelos resultados sem seleção inicial e escolhe pelo teclado', async () => {
    const secondCity: City = { ...mockWeatherData.city, id: 2, name: 'São Paulo, Portugal' };
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city, secondCity]);
    vi.mocked(getWeather).mockResolvedValue({ ...mockWeatherData, city: secondCity });
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    await user.type(input, 'São Paulo{Enter}');
    expect(await screen.findByRole('listbox', { name: 'Cidades encontradas' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByText('2 cidades encontradas.')).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', `city-option-${secondCity.id}`);
    await user.keyboard('{Enter}');

    expect(getWeather).toHaveBeenCalledWith(secondCity);
    expect(await screen.findByRole('region', { name: 'Clima atual' })).toHaveTextContent(
      'São Paulo, Portugal',
    );
  });

  it('dispensa resultados com Escape e anuncia busca vazia', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole('combobox', { name: 'Cidade' });
    await user.type(input, 'São Paulo{Enter}');
    await screen.findByRole('listbox', { name: 'Cidades encontradas' });
    await user.keyboard('{Escape}');

    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();

    vi.mocked(searchCities).mockResolvedValueOnce([]);
    await user.clear(input);
    await user.type(input, 'Atlantis{Enter}');
    expect(await screen.findByText('Nenhuma cidade encontrada para Atlantis.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
  });
});
