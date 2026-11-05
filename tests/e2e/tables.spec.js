import { test, expect } from '@playwright/test';
import { open, nav } from './helpers.js';

test('справочные таблицы: вход из Библиотеки, данные и переход в статью', async ({ page }) => {
  await open(page);
  await nav(page, 'catalog');
  await page.getByRole('button', { name: /Таблицы: температуры/ }).click();
  await expect(page.locator('h1')).toHaveText('Таблицы');
  await expect(page.locator('.ref-table')).toHaveCount(4);
  const temps = page.locator('#tbl-temps');
  await expect(temps.locator('tr', { hasText: 'Птица' })).toContainText('74 °C');
  await expect(page.locator('#tbl-storage tr', { hasText: 'Варёный рис' })).toContainText('до 1 суток');

  await temps.locator('.ref-more .link').first().click();
  await expect(page.locator('h2').first()).toContainText('пастеризации');
  await page.goBack();
  await expect(page.locator('h1')).toHaveText('Таблицы');
});

test('таблицы открываются с главной', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: /Справочные таблицы/ }).click();
  await expect(page.locator('#tbl-grains tr', { hasText: 'Гречка' })).toContainText('2 стакана');
});
