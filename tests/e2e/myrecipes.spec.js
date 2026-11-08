import { test, expect } from '@playwright/test';
import { open, nav } from './helpers.js';

test('свой рецепт: создание, порции, покупки, «Готовлю», меню, правка и удаление', async ({ page }) => {
  await open(page);
  await nav(page, 'favorites');
  await page.getByRole('button', { name: 'Добавить рецепт' }).click();
  await expect(page.locator('.screen-title')).toHaveText('Новый рецепт');

  // без названия не сохраняется
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.locator('.my-err')).toBeVisible();

  await page.getByLabel('Название').fill('Бабушкины оладьи');
  await page.getByLabel(/Ингредиенты/).fill('Кефир — 500 мл\nМука 2 стакана\nЯйца 2 шт\nСода ½ ч. л.\nСоль по вкусу');
  await page.getByLabel(/Шаги/).fill('1. Смешайте кефир с яйцами.\n2. Всыпьте муку и соду, оставьте на 15 минут.\n3. Жарьте 2–3 минуты с каждой стороны.');
  const preview = page.locator('.my-preview');
  await expect(preview.locator('li', { hasText: 'Мука' })).toContainText('2 стакана');
  await expect(preview.locator('li', { hasText: 'Сода' })).toContainText('½ ч. л.');
  await page.getByRole('button', { name: 'Сохранить' }).click();

  // экран рецепта: ингредиенты с калорийностью, пересчёт порций
  await expect(page.locator('.art-head h2')).toHaveText('Бабушкины оладьи');
  const card = page.locator('.ingr');
  await expect(card.locator('li', { hasText: 'Кефир' })).toContainText('500 мл');
  await expect(page.getByRole('button', { name: 'Пищевая ценность на порцию, примерно' })).toContainText(/≈ \d+ ккал/);
  await page.getByRole('button', { name: 'Больше порций' }).click();
  await page.getByRole('button', { name: 'Больше порций' }).click();
  await expect(card.locator('li', { hasText: 'Кефир' })).toContainText('1 л');
  await page.getByRole('button', { name: 'В список покупок' }).click();
  await expect(page.locator('.cart-btn .badge')).toHaveText('5');

  // «Готовлю»: ингредиенты, шаги, таймер из шага
  await page.getByRole('button', { name: 'Готовлю' }).click();
  await expect(page.locator('.cook-title')).toHaveText('Бабушкины оладьи');
  await page.getByRole('button', { name: 'Далее →' }).click();
  await expect(page.locator('.cook-text')).toHaveText('Смешайте кефир с яйцами.');
  await page.getByRole('button', { name: 'Далее →' }).click();
  await expect(page.getByRole('button', { name: /Таймер 15 мин/ })).toBeVisible();
  await page.getByRole('button', { name: '✕ Закрыть' }).click();

  // в меню на понедельник
  await page.getByRole('button', { name: 'В меню' }).click();
  await page.getByRole('button', { name: 'Понедельник' }).click();
  await nav(page, 'home');
  await page.getByRole('button', { name: /Меню на неделю/ }).click();
  await expect(page.locator('.menu-day').first()).toContainText('Бабушкины оладьи');
  await expect(page.locator('.menu-day').first().locator('.menu-kcal')).toContainText('ккал на человека');

  // после перезагрузки рецепт на месте; правка названия
  await page.reload();
  await nav(page, 'favorites');
  await page.locator('.my-card', { hasText: 'Бабушкины оладьи' }).click();
  await page.getByRole('button', { name: 'Изменить' }).click();
  await expect(page.getByLabel(/Ингредиенты/)).toHaveValue(/Мука — 2 стакан/);
  await page.getByLabel('Название').fill('Оладьи на кефире');
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.locator('.art-head h2')).toHaveText('Оладьи на кефире');

  // удаление убирает рецепт и из меню
  await page.getByRole('button', { name: 'Удалить' }).click();
  await nav(page, 'favorites');
  await expect(page.locator('.my-card')).toHaveCount(0);
  await nav(page, 'home');
  await page.getByRole('button', { name: /Меню на неделю/ }).click();
  await expect(page.locator('.menu-day').first()).not.toContainText('Оладьи');
});

test('свой рецепт: количество перед названием и фото блюда', async ({ page }) => {
  await open(page);
  await nav(page, 'favorites');
  await page.getByRole('button', { name: 'Добавить рецепт' }).click();
  await page.getByLabel('Название').fill('Блинчики');
  await page.getByLabel(/Ингредиенты/).fill('200 г муки\n2 яйца\n1,5 стакана молока\nщепотка соли');
  const preview = page.locator('.my-preview');
  await expect(preview.locator('li', { hasText: 'Мука' })).toContainText('200 г');
  await expect(preview.locator('li', { hasText: 'Яйца' })).toContainText('2 шт');
  await expect(preview.locator('li', { hasText: 'Молоко' })).toContainText('1½ стакана');
  // крошечная PNG-картинка 2×2
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMAAAB4AAwHp0ffGAAAAAElFTkSuQmCC', 'base64');
  await page.getByLabel('Фото блюда').setInputFiles({ name: 'dish.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('.my-photo')).toBeVisible();
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.locator('.my-photo-head')).toBeVisible();
  await page.reload();
  await nav(page, 'favorites');
  await expect(page.locator('.my-card .my-thumb')).toBeVisible();
});
