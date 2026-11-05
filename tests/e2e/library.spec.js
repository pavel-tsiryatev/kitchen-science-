import { test, expect } from '@playwright/test';
import { open, nav, pill, btn } from './helpers.js';

test.beforeEach(async ({ page }) => { await open(page); await nav(page, 'catalog'); });

test('показывает все статьи', async ({ page }) => {
  await expect(page.locator('.card-clickable')).toHaveCount(36);
  await expect(page.locator('.pill.active')).toHaveText('Все (36)');
});

test('поиск без учёта регистра и буквы ё', async ({ page }) => {
  await page.fill('#catSearchInput', 'МАЙЯР');
  const n = await page.locator('.card-clickable').count();
  expect(n).toBeGreaterThan(0); expect(n).toBeLessThan(36);

  // «теплоёмкость» встречается в статьях; поиск с «е» и с «ё» находит одно и то же
  await page.fill('#catSearchInput', 'теплоёмкост');
  const withYo = await page.locator('.card-clickable').count();
  expect(withYo).toBeGreaterThan(0);
  await page.fill('#catSearchInput', 'теплоемкост');
  await expect(page.locator('.card-clickable')).toHaveCount(withYo);
});

test('пустой результат и сброс фильтров', async ({ page }) => {
  await page.fill('#catSearchInput', 'абракадабра');
  await expect(page.getByText('Ничего не найдено')).toBeVisible();
  await btn(page, 'Сбросить фильтры').click();
  await expect(page.locator('#catSearchInput')).toHaveValue('');
  await expect(page.locator('.card-clickable')).toHaveCount(36);
});

test('фильтр по разделу и «Непрочитанные»', async ({ page }) => {
  await pill(page, 'А. Выпечка');
  const inSection = await page.locator('.card-clickable').count();
  await expect(page.locator('.ed-m').first()).toContainText('Выпечка и тесто');
  expect(inSection).toBeLessThan(36);

  await page.locator('.card-clickable').first().click();
  await page.locator('button:has(.sr)', { hasText: 'Отметить прочитанным' }).click();
  await nav(page, 'catalog');
  await pill(page, 'Непрочитанные');
  await expect(page.locator('.card-clickable')).toHaveCount(35);
});
