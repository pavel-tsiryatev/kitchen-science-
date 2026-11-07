import { test, expect } from '@playwright/test';
import { open, nav, saved } from './helpers.js';

const openDish = async (page, q) => {
  await nav(page, 'catalog');
  await page.fill('#catSearchInput', q);
  await page.locator('.card-clickable').first().click();
};

test('режим «Готовлю»: шаги, таймер из шага, заметка в конце, «Назад» к статье', async ({ page }) => {
  await open(page);
  await openDish(page, 'жареная картошка');
  await page.getByRole('button', { name: 'Больше порций' }).click();
  await page.getByRole('button', { name: 'Готовлю' }).click();
  await expect(page.locator('.cook-kicker')).toContainText('Ингредиенты · 3 порц.');
  await page.getByRole('button', { name: 'Далее →' }).click();
  await expect(page.locator('.cook-kicker')).toContainText('Шаг 1');
  for (let k = 0; k < 3; k++) await page.getByRole('button', { name: 'Далее →' }).click();
  await expect(page.locator('.cook-text')).toContainText('5–7 минут');
  await page.getByRole('button', { name: 'Таймер 5 мин' }).click();
  await expect(page.locator('.timer')).toContainText('Жареная картошка · 5 мин');
  await expect(page.locator('.timer-t')).toHaveText(/^4:5\d$/);

  const last = page.getByRole('button', { name: 'Далее →' });
  while (await last.isEnabled()) await last.click();
  await expect(page.locator('.cook-kicker')).toHaveText('Готово');
  await page.locator('.notes textarea').fill('в следующий раз больше лука');
  await page.locator('.notes textarea').blur();
  expect((await saved(page)).notes.i1).toBe('в следующий раз больше лука');

  await page.getByRole('button', { name: '✕ Закрыть' }).click();
  await expect(page.locator('h2').first()).toContainText('Жареная картошка');
  await expect(page.locator('.notes textarea')).toHaveValue('в следующий раз больше лука');
  await page.getByRole('button', { name: 'Остановить таймер' }).click();
  await expect(page.locator('.timer')).toHaveCount(0);
});

test('«Что приготовить»: продукты → блюда, отметки сохраняются', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: /Что приготовить из того, что есть/ }).click();
  for (const n of ['Картофель', 'Яйца', 'Лук', 'Мука']) await page.locator('.chips .pill', { hasText: new RegExp('^' + n + '$') }).click();
  await expect(page.locator('.fr-card', { hasText: 'Драники' })).toContainText('Всё есть');
  await expect(page.locator('.fr-card', { hasText: 'Блины' })).toContainText('Не хватает: Молоко');
  expect((await saved(page)).fridge.sort()).toEqual(['eggs', 'flour', 'onion', 'potato']);
  await page.locator('.fr-card', { hasText: 'Драники' }).click();
  await expect(page.locator('h2').first()).toContainText('Драники');
});

test('подборки на главной открываются и «Назад» возвращает на главную', async ({ page }) => {
  await open(page);
  await page.locator('.col-card', { hasText: 'Для начинающих' }).click();
  await expect(page.locator('h1')).toHaveText('Для начинающих');
  await expect(page.locator('.card-clickable').first()).toBeVisible();
  await page.goBack();
  await expect(page.locator('.col-card').first()).toBeVisible();
});
