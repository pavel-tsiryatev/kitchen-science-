import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { open, btn, toast, saved, KEY } from './helpers.js';

const toSettings = page => page.locator('header .icon-btn').click();
// Chromium не читает файлы для <input type=file> по путям с кириллицей, а папка
// результатов Playwright называется по имени теста. Поэтому файлы — во временной папке.
const tmpFile = name => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kuhnya-')), name);

test('тема и размер шрифта применяются и сохраняются', async ({ page }) => {
  await open(page); await toSettings(page);
  await btn(page, 'Тёмная').click();
  await btn(page, 'А+').click();
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  expect(await html.evaluate(e => e.style.getPropertyValue('--font-scale'))).toBe('1.12');
});

test('избранное можно убрать из настроек', async ({ page }) => {
  await open(page, { favIds: ['a1', 'b1'] }); await toSettings(page);
  await expect(page.locator('.card h3').first()).toHaveText('★ Избранные статьи (2)');
  await page.getByRole('button', { name: 'Убрать из избранного' }).first().click();
  await expect(page.locator('.card h3').first()).toHaveText('★ Избранные статьи (1)');
});

test('экспорт в поле → правка → импорт', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, { favIds: ['a1'] }); await toSettings(page);
  await btn(page, 'Копировать JSON').click();
  await expect(toast(page)).toHaveText('Копия скопирована в буфер обмена');
  const text = await page.inputValue('#backupArea');
  expect(JSON.parse(text).data.favIds).toEqual(['a1']);

  await page.fill('#backupArea', text.replace('"a1"', '"b2"'));
  await btn(page, 'Импорт из поля').click();
  await expect(toast(page)).toHaveText('Данные импортированы');
  await expect(page.locator('#backupArea')).toHaveValue('');
  expect((await saved(page)).favIds).toEqual(['b2']);
});

test('скачивание файла и импорт из файла', async ({ page }) => {
  await open(page, { readIds: ['a1', 'a2'] }); await toSettings(page);
  const [download] = await Promise.all([page.waitForEvent('download'), btn(page, 'Скачать файл').click()]);
  expect(download.suggestedFilename()).toMatch(/^kuhnya-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const file = tmpFile('backup.json');
  await download.saveAs(file);
  expect(JSON.parse(fs.readFileSync(file, 'utf8')).data.readIds).toEqual(['a1', 'a2']);

  await btn(page, 'Сбросить прогресс чтения').click();
  expect((await saved(page)).readIds).toEqual([]);

  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), btn(page, 'Импорт из файла').click()]);
  await chooser.setFiles(file);
  await expect(toast(page)).toHaveText('Данные импортированы');
  expect((await saved(page)).readIds).toEqual(['a1', 'a2']);
});

test('битый файл не ломает данные', async ({ page }) => {
  await open(page, { favIds: ['a1'] }); await toSettings(page);
  const bad = tmpFile('bad.json'); fs.writeFileSync(bad, 'это не json');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), btn(page, 'Импорт из файла').click()]);
  await chooser.setFiles(bad);
  await expect(toast(page)).toContainText('Это не JSON');
  expect((await saved(page)).favIds).toEqual(['a1']);
});

test('повреждённые сохранённые данные: сообщение и запуск с чистого листа', async ({ page }) => {
  await open(page, '{сломано');
  await expect(toast(page)).toContainText('не удалось прочитать');
  expect(await page.evaluate(k => localStorage.getItem(k + '_corrupt'), KEY)).toBe('{сломано');
  await expect(page.locator('.mono-s')).toHaveText('0 из 36');
});
