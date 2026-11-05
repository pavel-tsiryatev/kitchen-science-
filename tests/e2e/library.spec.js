import { test, expect } from '@playwright/test';
import { open, nav, pill, btn, TOTAL } from './helpers.js';

test.beforeEach(async ({ page }) => { await open(page); await nav(page, 'catalog'); });

test('показывает все статьи', async ({ page }) => {
  await expect(page.locator('.card-clickable')).toHaveCount(TOTAL);
  await expect(page.locator('.pill.active')).toHaveText(`Все (${TOTAL})`);
});

test('поиск без учёта регистра и буквы ё', async ({ page }) => {
  await page.fill('#catSearchInput', 'МАЙЯР');
  const n = await page.locator('.card-clickable').count();
  expect(n).toBeGreaterThan(0); expect(n).toBeLessThan(TOTAL);

  // «теплоёмкость» встречается в статьях; поиск с «е» и с «ё» находит одно и то же
  await page.fill('#catSearchInput', 'теплоёмкост');
  const withYo = await page.locator('.card-clickable').count();
  expect(withYo).toBeGreaterThan(0);
  await page.fill('#catSearchInput', 'теплоемкост');
  await expect(page.locator('.card-clickable')).toHaveCount(withYo);
});

test('поиск понимает формы слов, подсвечивает и показывает фрагмент', async ({ page }) => {
  await page.fill('#catSearchInput', 'клейковиной');
  const first = page.locator('.card-clickable').first();
  await expect(first.locator('.ed-t')).toHaveText('Формирование клейковины и развитие глютеновой сетки');
  await expect(first.locator('.ed-t mark')).toHaveText('клейковины');
  await expect(page.locator('.search-count')).toContainText('Найдено:');

  // слово есть только в тексте статьи, а не в заголовке — в карточке появляется фрагмент
  await page.fill('#catSearchInput', 'цереулида');
  const card = page.locator('.card-clickable', { hasText: 'Остывающая еда' });
  await expect(card.locator('.ed-s mark').first()).toHaveText(/^цереулид/i);
  await expect(card.locator('.ed-t mark')).toHaveCount(0);
});

test('пустой результат и сброс фильтров', async ({ page }) => {
  await page.fill('#catSearchInput', 'абракадабра');
  await expect(page.getByText('Ничего не найдено')).toBeVisible();
  await btn(page, 'Сбросить фильтры').click();
  await expect(page.locator('#catSearchInput')).toHaveValue('');
  await expect(page.locator('.card-clickable')).toHaveCount(TOTAL);
});

test('фильтр по разделу и «Непрочитанные»', async ({ page }) => {
  await pill(page, 'А. Выпечка');
  const inSection = await page.locator('.card-clickable').count();
  await expect(page.locator('.ed-m').first()).toContainText('Выпечка и тесто');
  expect(inSection).toBeLessThan(TOTAL);

  await page.locator('.card-clickable').first().click();
  await page.locator('button:has(.sr)', { hasText: 'Отметить прочитанным' }).click();
  await nav(page, 'catalog');
  await pill(page, 'Непрочитанные');
  await expect(page.locator('.card-clickable')).toHaveCount(TOTAL - 1);
});

test('популярные блюда делятся на подгруппы, «Назад» возвращает в ту же подгруппу', async ({ page }) => {
  await pill(page, 'Популярные блюда');
  const sub = page.locator('.sub-pills .pill');
  await expect(sub.first()).toHaveText(/^Все блюда \(\d+\)$/);
  const soups = page.locator('.sub-pills .pill', { hasText: 'Супы' });
  const n = Number((await soups.textContent()).match(/\((\d+)\)/)[1]);
  expect(n).toBeGreaterThan(0);
  await soups.click();
  await expect(page.locator('.card-clickable')).toHaveCount(n);
  await expect(page.locator('.card-clickable', { hasText: 'Борщ' })).toBeVisible();

  await page.locator('.card-clickable', { hasText: 'Борщ' }).click();
  await expect(page.locator('h2').first()).toContainText('Борщ');
  await page.goBack();
  await expect(page.locator('.sub-pills .pill.active')).toContainText('Супы');
  await expect(page.locator('.card-clickable')).toHaveCount(n);

  // другой раздел — второго ряда нет
  await pill(page, 'Все (');
  await expect(page.locator('.sub-pills')).toHaveCount(0);
});
