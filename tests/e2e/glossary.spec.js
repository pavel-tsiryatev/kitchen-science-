import { test, expect } from '@playwright/test';
import { open, nav } from './helpers.js';

test.beforeEach(({ page }) => open(page));

test('термин в статье открывает определение, оттуда — глоссарий', async ({ page }) => {
  await page.locator('.cover .btn').click(); // статья о клейковине
  const term = page.locator('button.term', { hasText: 'глютенин' }).first();
  await term.click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.locator('h3')).toHaveText('Глютенин');
  await expect(sheet).toContainText('упругость');

  await sheet.getByRole('button', { name: 'Открыть глоссарий' }).click();
  await expect(page.locator('.screen-title')).toHaveText('Глоссарий');
  await expect(page.locator('#term-glutenin')).toBeInViewport();
  await expect(page.locator('.nav-item.active')).toHaveAttribute('data-tab', 'catalog');
});

test('карточка термина закрывается крестиком, фоном и Escape', async ({ page }) => {
  await page.locator('.cover .btn').click();
  const term = page.locator('button.term').first();
  await term.click(); await page.getByRole('button', { name: 'Закрыть определение' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await term.click(); await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('карточка термина видна на экране, даже если термин внизу длинной статьи', async ({ page }) => {
  await page.locator('.cover .btn').click();
  const term = page.locator('button.term').last();
  await term.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400); // анимация появления экрана закончилась
  await term.click();
  await expect(page.getByRole('dialog')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Закрыть определение' })).toBeInViewport();
});

test('глоссарий: поиск по форме слова и по определению, переход в статью', async ({ page }) => {
  await nav(page, 'catalog');
  await page.locator('.gl-entry', { hasText: 'Глоссарий' }).click();
  await expect(page.locator('.gl-term').first()).toBeVisible();
  await page.fill('input[aria-label="Найти термин"]', 'клейковиной');
  await expect(page.locator('.gl-term h3').first()).toContainText('Клейковина');
  await page.fill('input[aria-label="Найти термин"]', 'черствения');
  await expect(page.locator('.gl-term h3', { hasText: 'Ретроградация' })).toBeVisible();
  await page.locator('#term-retrogradation .link').first().click();
  await expect(page.locator('.art-head h2')).toContainText('Черствение хлеба');
});

test('поиск в библиотеке показывает подходящие термины', async ({ page }) => {
  await nav(page, 'catalog');
  await page.fill('#catSearchInput', 'эмульгатор');
  await expect(page.locator('.search-terms .term-hit').first()).toContainText('Эмульгатор');
  await page.locator('.search-terms .term-hit').first().click();
  await expect(page.getByRole('dialog').locator('h3')).toHaveText('Эмульгатор');
});
