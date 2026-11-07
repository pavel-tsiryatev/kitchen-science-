import { test, expect } from '@playwright/test';
import { open, nav } from './helpers.js';

test('знакомство при первом запуске: 4 экрана, потом не показывается', async ({ page }) => {
  await open(page, undefined, { onboarding: true });
  const dlg = page.getByRole('dialog');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('h2')).toContainText('Почему на кухне');
  for (let k = 0; k < 3; k++) await dlg.getByRole('button', { name: 'Далее' }).click();
  await expect(dlg.locator('h2')).toContainText('Что приготовить');
  await dlg.getByRole('button', { name: 'Начать' }).click();
  await expect(dlg).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#app-Main')).not.toBeEmpty();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // можно открыть снова из настроек
  await page.getByRole('button', { name: 'Настройки' }).click();
  await page.getByRole('button', { name: 'Показать знакомство с приложением' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Пропустить' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('«Поделиться рецептом» копирует ингредиенты на выбранные порции и шаги', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page);
  await page.evaluate(() => { delete Navigator.prototype.share; }); // в браузере без системного окна — копирование
  await nav(page, 'catalog');
  await page.fill('#catSearchInput', 'жареная картошка');
  await page.locator('.card-clickable').first().click();
  await page.getByRole('button', { name: 'Больше порций' }).click();
  await page.getByRole('button', { name: 'Поделиться рецептом' }).click();
  await expect(page.locator('#toast')).toContainText('Рецепт скопирован');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('Ингредиенты (3 порции):');
  expect(text).toContain('Как готовить:');
});
