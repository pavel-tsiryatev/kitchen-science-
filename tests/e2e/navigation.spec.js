import { test, expect } from '@playwright/test';
import { open, nav, pill } from './helpers.js';

test.beforeEach(({ page }) => open(page));

test('нижнее меню переключает экраны и подсвечивает текущий', async ({ page }) => {
  const screens = [['catalog', 'Библиотека'], ['tools', 'Лаборатория'], ['favorites', 'Сохранённое']];
  for (const [tab, title] of screens) {
    await nav(page, tab);
    await expect(page.locator('.screen-title')).toHaveText(title);
    await expect(page.locator('.nav-item.active')).toHaveAttribute('data-tab', tab);
  }
  await page.locator('.brand').click();
  await expect(page.locator('.cover h2')).toHaveText('Почему хлеб становится воздушным?');
  await expect(page.locator('.nav-item.active')).toHaveAttribute('data-tab', 'home');
});

test('статья подсвечивает «Библиотеку», журнал — «Лабораторию»', async ({ page }) => {
  await page.locator('.cover .btn').click();
  await expect(page.locator('.nav-item.active')).toHaveAttribute('data-tab', 'catalog');
  await nav(page, 'tools'); await pill(page, 'Журнал');
  await expect(page.locator('.nav-item.active')).toHaveAttribute('data-tab', 'tools');
});

test('кнопка «Назад» проходит по истории, включая вкладки лаборатории', async ({ page }) => {
  await nav(page, 'tools');
  await pill(page, 'Журнал');
  await pill(page, 'Тесты');
  await nav(page, 'catalog');
  await page.locator('.card-clickable').first().click();
  await expect(page.locator('.art-head h2')).toBeVisible();

  await page.goBack();
  await expect(page.locator('.screen-title')).toHaveText('Библиотека');
  await page.goBack();
  await expect(page.locator('.pill.active')).toHaveText('Тесты');
  await page.goBack();
  await expect(page.locator('.pill.active')).toHaveText('Журнал');
  await expect(page.locator('#jDish')).toBeVisible();
});

test('карточки на главной ведут в нужные разделы', async ({ page }) => {
  await page.locator('.dir', { hasText: 'Химия вкуса' }).click();
  await expect(page.locator('.pill.active')).toContainText('Химия вкуса и аромата');
  await page.locator('.brand').click();
  await page.locator('.row', { hasText: 'Диагностика ошибок' }).click();
  await expect(page.locator('.pill.active')).toHaveText('Ошибки');
  await page.locator('.brand').click();
  await page.locator('.searchbar').click();
  await expect(page.locator('#catSearchInput')).toBeFocused();
});

test('карточку статьи можно открыть с клавиатуры', async ({ page }) => {
  await nav(page, 'catalog');
  const card = page.locator('.card-clickable').first();
  const title = await card.locator('.ed-t').textContent();
  await card.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.art-head h2')).toHaveText(title);
});
