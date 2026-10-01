import { expect, type Locator, type Page, test } from '@playwright/test';

const viewports = [
  { label: 'mobile pequeno', width: 320, height: 640 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1024, height: 768 },
  { label: 'desktop amplo', width: 1920, height: 1080 },
] as const;

const longCityName = 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch';

const geocodingResults = [
  {
    id: 3448439,
    name: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
    admin1: 'São Paulo',
    country: 'Brasil',
  },
  {
    id: 2644605,
    name: longCityName,
    latitude: 53.22,
    longitude: -4.2,
    admin1: 'Wales',
    country: 'ReinoUnidoDaGrãBretanhaEIrlandaDoNorte',
  },
];

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  current: {
    temperature_2m: 0,
    apparent_temperature: -2.5,
    relative_humidity_2m: 70,
    weather_code: 0,
    precipitation: 0,
    pressure_msl: 1013,
    wind_speed_10m: 10,
  },
  daily: {
    time: ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'],
    weather_code: [0, 1, 2, 3, 45],
    temperature_2m_min: [-10, 10, 11, 12, 13],
    temperature_2m_max: [-5, 16, 17, 18, 19],
    precipitation_probability_max: [0, 10, 20, 30, 100],
  },
};

async function mockWeatherRoutes(page: Page) {
  await page.route('**/geocoding-api.open-meteo.com/v1/search**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { results: geocodingResults },
    }),
  );
  await page.route('**/api.open-meteo.com/v1/forecast**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', json: forecastResponse }),
  );
}

async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, 'página não deve ter rolagem horizontal').toBeLessThanOrEqual(clientWidth);
}

async function expectInsideViewportWidth(locator: Locator, viewportWidth: number) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth);
}

async function expectTextNotClipped(locator: Locator) {
  const clipped = await locator.evaluate((element) => element.scrollWidth > element.clientWidth);
  expect(clipped, 'conteúdo não deve ser cortado horizontalmente').toBe(false);
}

for (const viewport of viewports) {
  test.describe(`responsividade em ${viewport.width}px (${viewport.label})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('busca, seleciona cidade, alterna unidade e exibe previsão sem rolagem horizontal', async ({
      page,
    }) => {
      await mockWeatherRoutes(page);
      await page.goto('/');
      await expectNoHorizontalScroll(page);

      const input = page.getByRole('combobox', { name: 'Cidade' });
      const searchButton = page.getByRole('button', { name: 'Buscar' });
      const celsius = page.getByRole('button', { name: 'Celsius' });
      const fahrenheit = page.getByRole('button', { name: 'Fahrenheit' });
      for (const control of [input, searchButton, celsius, fahrenheit]) {
        await expectInsideViewportWidth(control, viewport.width);
      }

      await input.fill('São Paulo');
      await searchButton.click();

      const options = page.getByRole('option');
      await expect(options).toHaveCount(geocodingResults.length);
      for (const option of await options.all()) {
        await expectInsideViewportWidth(option, viewport.width);
        await expectTextNotClipped(option);
      }
      await expectNoHorizontalScroll(page);

      await page.getByRole('option', { name: /^São Paulo/ }).click();
      await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();

      const currentWeather = page.getByRole('region', { name: 'Clima atual' });
      await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();
      await expectInsideViewportWidth(currentWeather, viewport.width);

      const days = page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('listitem');
      await expect(days).toHaveCount(5);
      for (const day of await days.all()) {
        await expectInsideViewportWidth(day, viewport.width);
      }
      await expectNoHorizontalScroll(page);

      await expectInsideViewportWidth(fahrenheit, viewport.width);
      await fahrenheit.click();
      await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
      await expect(currentWeather.getByText('32,0 °F', { exact: true })).toBeVisible();
      await expect(days.first()).toContainText('23,0 °F');
      for (const day of await days.all()) {
        await expectInsideViewportWidth(day, viewport.width);
      }
      await expectNoHorizontalScroll(page);

      await input.fill('Llan');
      await searchButton.click();
      await page.getByRole('option', { name: new RegExp(longCityName) }).click();
      const longHeading = page.getByRole('heading', { name: longCityName });
      await expectInsideViewportWidth(longHeading, viewport.width);
      await expect(days).toHaveCount(5);
      await expectNoHorizontalScroll(page);
    });
  });
}
