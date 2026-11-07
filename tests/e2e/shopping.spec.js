import { test, expect } from '@playwright/test';
import { open, nav, saved } from './helpers.js';

test('рецепт: пересчёт порций и список покупок с отметками и сохранением', async ({ page }) => {
  await open(page);
  await nav(page, 'catalog');
  await page.fill('#catSearchInput', 'жареная картошка');
  await page.locator('.card-clickable').first().click();

  const card = page.locator('.ingr');
  await expect(card.locator('li', { hasText: 'Картофель' })).toContainText('600–700 г');
  await page.getByRole('button', { name: 'Больше порций' }).click();
  await page.getByRole('button', { name: 'Больше порций' }).click();
  await expect(card).toContainText('4 порции');
  await expect(card.locator('li', { hasText: 'Картофель' })).toContainText('1,2–1,4 кг');
  await expect(card.locator('.ingr-note')).toBeVisible();

  await page.getByRole('button', { name: 'В список покупок' }).click();
  await expect(page.locator('.cart-btn .badge')).toHaveText('4');
  await page.getByRole('button', { name: /Открыть список/ }).click();
  await expect(page.locator('h1')).toHaveText('Список покупок');
  await expect(page.locator('.shop-list li', { hasText: 'Картофель' })).toContainText('1,2–1,4 кг');

  await page.locator('.shop-list li', { hasText: 'Картофель' }).locator('input').check();
  await expect(page.locator('.cart-btn .badge')).toHaveText('3');
  await page.fill('.shop-add input', 'Хлеб');
  await page.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(page.locator('.shop-list li', { hasText: 'Хлеб' })).toBeVisible();

  const s = await saved(page);
  expect(s.shopping.find(x => x.name === 'Картофель')).toMatchObject({ qty: [1200, 1400], done: true });

  await page.reload();
  await page.locator('.cart-btn').click();
  await expect(page.locator('.shop-list li')).toHaveCount(5);
  await page.getByRole('button', { name: 'Убрать купленное' }).click();
  await expect(page.locator('.shop-list li', { hasText: 'Картофель' })).toHaveCount(0);
});
