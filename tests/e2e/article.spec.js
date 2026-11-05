import { test, expect } from '@playwright/test';
import { open, nav, saved } from './helpers.js';

test.beforeEach(async ({ page }) => { await open(page); await page.locator('.cover .btn').click(); });

test('проверенная статья: блоки, доказательность и источники с DOI', async ({ page }) => {
  await expect(page.locator('.art-head h2')).toHaveText('Формирование клейковины и развитие глютеновой сетки');
  await expect(page.locator('.evidence')).toContainText('Источники проверены');
  await expect(page.locator('.art-block h4')).toHaveText([
    '1. Что происходит', '2. Почему это происходит (научный механизм)', '3. Что влияет на результат',
    '4. Как применить на практике', '5. Типичные ошибки и как их избежать', '6. Небольшой домашний эксперимент',
    '7. Границы применимости', '8. Краткий вывод (Запомнить)',
  ]);
  await expect(page.locator('.art-block').first().locator('.art-p')).toHaveCount(2); // абзацы из Markdown
  const doi = page.locator('.sources a', { hasText: 'DOI 10.1016/j.jcs.2013.01.011' });
  await expect(doi).toHaveAttribute('href', 'https://doi.org/10.1016/j.jcs.2013.01.011');
  await expect(doi).toHaveAttribute('target', '_blank');
  await expect(page.locator('.src-meta')).toContainText('Источники сверены 05.11.2026');
});

test('статья с непроверенными источниками честно это показывает', async ({ page }) => {
  await page.locator('.nav-item[data-tab=catalog]').click();
  await page.locator('.card-clickable', { hasText: 'Дрожжевое брожение' }).click();
  await expect(page.locator('.evidence')).toHaveCount(0);
  await expect(page.locator('.art-block h4').last()).toHaveText('7. Краткий вывод (Запомнить)');
  await expect(page.locator('.src-meta')).toHaveText('Источники этой статьи ещё не сверены по научным базам.');
});

test('избранное и «прочитано» видны в карточках, в «Сохранённом» и на главной', async ({ page }) => {
  await page.locator('button:has(.sr)', { hasText: 'В избранное' }).click();
  await page.locator('button:has(.sr)', { hasText: 'Отметить прочитанным' }).click();
  await expect(page.locator('button:has(.sr)', { hasText: 'Убрать из избранного' })).toBeVisible();
  expect(await saved(page)).toMatchObject({ favIds: ['a1'], readIds: ['a1'] });

  await nav(page, 'favorites');
  await expect(page.locator('.sub')).toHaveText('Избранные статьи: 1');
  await expect(page.locator('.ed-m')).toContainText('✓ изучено · ★');

  await page.locator('.brand').click();
  await expect(page.locator('.mono-s')).toHaveText('1 из 36');
  await expect(page.locator('.eyebrow', { hasText: 'Недавно открытые' })).toBeVisible();
});

test('вопрос: ответ подсвечивается, есть разбор и «Ответить заново»', async ({ page }) => {
  const opts = page.locator('.card .quiz-opt');
  await expect(opts).toHaveCount(4);
  await opts.filter({ hasText: 'Глиадин' }).click(); // неверный ответ
  await expect(opts.filter({ hasText: 'Глиадин' })).toHaveClass(/wrong/);
  await expect(opts.filter({ hasText: 'Глютенин' })).toHaveClass(/correct/);
  await expect(page.getByText('Разбор:')).toBeVisible();
  expect((await saved(page)).readIds).toEqual(['a1']); // ответ отмечает статью прочитанной

  await page.getByRole('button', { name: 'Ответить заново' }).click();
  await expect(page.locator('.card .quiz-opt.correct')).toHaveCount(0);
});

test('связанная тема открывает другую статью', async ({ page }) => {
  const link = page.locator('div[role=button]', { hasText: '→' }).first();
  const title = (await link.textContent()).replace('→', '').trim();
  await link.click();
  await expect(page.locator('.art-head h2')).toHaveText(title);
});

test('кнопка «назад» в статье ведёт в её раздел', async ({ page }) => {
  await page.getByRole('button', { name: 'Выпечка' }).click();
  await expect(page.locator('.pill.active')).toContainText('Выпечка и тесто');
});
