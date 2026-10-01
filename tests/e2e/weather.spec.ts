import { expect, type Page, test } from '@playwright/test';

interface WeatherRouteOptions {
  geocodingResults?: Record<string, unknown>[];
  forecastResponse?: Record<string, unknown>;
}

const completeForecastResponse: Record<string, unknown> = {
  timezone: 'America/Sao_Paulo',
  current: {
    temperature_2m: 0,
    apparent_temperature: 0,
    relative_humidity_2m: 70,
    weather_code: 0,
    precipitation: 0,
    pressure_msl: 1013,
    wind_speed_10m: 10,
  },
  daily: {
    time: ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'],
    weather_code: [0, 1, 2, 3, 45],
    temperature_2m_min: [0, 10, 11, 12, 13],
    temperature_2m_max: [5, 16, 17, 18, 19],
    precipitation_probability_max: [0, 10, 20, 30, 40],
  },
};

async function mockWeatherRoutes(page: Page, options: WeatherRouteOptions = {}) {
  await page.route('**/geocoding-api.open-meteo.com/v1/search**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        results: options.geocodingResults ?? [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            admin1: 'São Paulo',
            country: 'Brasil',
          },
        ],
      },
    }),
  );

  await page.route('**/api.open-meteo.com/v1/forecast**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: options.forecastResponse ?? completeForecastResponse,
    }),
  );
}

test('busca uma cidade, exibe a previsão e converte a temperatura', async ({ page }) => {
  await mockWeatherRoutes(page);
  const appOrigin = new URL('http://localhost:5173').origin;
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== appOrigin) {
      externalRequests.push(request.url());
    }
  });

  await page.goto('/');
  expect(externalRequests).toEqual([]);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page).toHaveTitle('Tempo Agora | Previsão do tempo');
  await page.getByRole('combobox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('option', { name: /São Paulo/ }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  const currentWeather = page.getByRole('region', { name: 'Clima atual' });
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();

  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveCount(5);
  await expect(
    page.getByText(
      'Este app não fornece alertas meteorológicos severos. Consulte os serviços oficiais da sua região para avisos.',
    ),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(currentWeather.getByText('32,0 °F', { exact: true })).toBeVisible();
});

test('apresenta no máximo cinco cidades únicas na ordem do provedor', async ({ page }) => {
  const geocodingResults = [
    { id: 1, name: 'Cidade A', latitude: 1, longitude: 1 },
    { id: 1, name: 'Cidade A duplicada', latitude: 2, longitude: 2 },
    { id: 2, name: 'Cidade B', latitude: 3, longitude: 3 },
    { id: 3, name: 'Cidade C', latitude: 4, longitude: 4 },
    { id: 4, name: 'Cidade D', latitude: 5, longitude: 5 },
    { id: 5, name: 'Cidade E', latitude: 6, longitude: 6 },
    { id: 6, name: 'Cidade F', latitude: 7, longitude: 7 },
  ];
  await mockWeatherRoutes(page, { geocodingResults });

  await page.goto('/');
  await page.getByRole('combobox', { name: 'Cidade' }).fill('Cidade');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const options = page.getByRole('option');
  await expect(options).toHaveCount(5);
  await expect(options.nth(0)).toContainText('Cidade A');
  await expect(options.nth(1)).toContainText('Cidade B');
  await expect(options.nth(4)).toContainText('Cidade E');
  await expect(page.getByRole('option', { name: 'Cidade A duplicada' })).toHaveCount(0);
});

test('mostra estado vazio quando o geocoding não retorna results', async ({ page }) => {
  const maliciousQuery = '<script>alert(1)</script>';
  let forecastRequests = 0;
  await page.route('**/geocoding-api.open-meteo.com/v1/search**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', json: {} }),
  );
  await page.route('**/api.open-meteo.com/v1/forecast**', (route) => {
    forecastRequests += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', json: {} });
  });

  await page.goto('/');
  await page.getByRole('combobox', { name: 'Cidade' }).fill(maliciousQuery);
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByText(`Não encontramos dados para ${maliciousQuery}.`)).toBeVisible();
  await expect(page.locator('#conteudo script')).toHaveCount(0);
  expect(forecastRequests).toBe(0);
});

test('não consulta geocoding ao enviar cidade vazia ou só com espaços por Enter', async ({
  page,
}) => {
  let geocodingRequests = 0;
  await page.route('**/geocoding-api.open-meteo.com/v1/search**', (route) => {
    geocodingRequests += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', json: {} });
  });

  await page.goto('/');
  const input = page.getByRole('combobox', { name: 'Cidade' });
  await input.focus();
  await input.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('Informe o nome da cidade.');
  await expect(input).toBeFocused();

  await input.fill('   ');
  await input.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('Informe o nome da cidade.');
  await expect(input).toBeFocused();
  expect(geocodingRequests).toBe(0);
});

test('preserva acentos e apóstrofo na consulta de geocoding', async ({ page }) => {
  const cityName = "São José d'Oeste";
  let requestedName: string | null = null;
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname === 'geocoding-api.open-meteo.com') {
      requestedName = url.searchParams.get('name');
    }
  });
  await mockWeatherRoutes(page, {
    geocodingResults: [
      {
        id: 1,
        name: cityName,
        latitude: -23.2,
        longitude: -45.9,
        admin1: 'São Paulo',
        country: 'Brasil',
      },
    ],
  });

  await page.goto('/');
  await page.getByRole('combobox', { name: 'Cidade' }).fill(`  ${cityName}  `);
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('option', { name: new RegExp(cityName) }).click();

  expect(requestedName).toBe(cityName);
  await expect(page.getByRole('heading', { name: cityName })).toBeVisible();
});

test('renderiza forecast parcial sem expor campos ausentes', async ({ page }) => {
  await mockWeatherRoutes(page, {
    forecastResponse: {
      timezone: 'America/Sao_Paulo',
      current: { temperature_2m: 12.5 },
      daily: {
        time: ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'],
        temperature_2m_min: [null, 11, 12, 13, 14],
      },
    },
  });

  await page.goto('/');
  await page.getByRole('combobox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('option', { name: /São Paulo/ }).click();

  const currentWeather = page.getByRole('region', { name: 'Clima atual' });
  await expect(currentWeather.getByText('12,5 °C')).toBeVisible();
  await expect(currentWeather.getByText('Sensação térmica: Indisponível')).toBeVisible();

  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  const days = forecast.getByRole('listitem');
  await expect(days).toHaveCount(5);
  await expect(days.first()).toContainText('Indisponível');
  await expect(forecast).not.toContainText(/undefined|NaN|Infinity/);
});

test('renderiza o clima no fluxo principal em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockWeatherRoutes(page);

  await page.goto('/');
  await page.getByRole('combobox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('option', { name: /São Paulo/ }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  const currentWeather = page.getByRole('region', { name: 'Clima atual' });
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('listitem'),
  ).toHaveCount(5);
});
