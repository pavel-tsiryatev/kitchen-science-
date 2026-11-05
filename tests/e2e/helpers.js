import { expect } from '@playwright/test';

export const KEY = 'kuhnya_science_v1';

/** Открыть приложение с чистыми данными (или с заданным сохранённым состоянием) */
export async function open(page, saved) {
  await page.addInitScript(([key, data]) => {
    if (sessionStorage.getItem('__init')) return; // только при первом открытии, не после reload
    sessionStorage.setItem('__init', '1');
    localStorage.clear();
    if (data) localStorage.setItem(key, data);
  }, [KEY, saved === undefined ? null : typeof saved === 'string' ? saved : JSON.stringify({ schema: 2, ...saved })]);
  page.on('dialog', d => d.accept());
  await page.goto('/');
  await expect(page.locator('#app-Main')).not.toBeEmpty();
}

export const nav = (page, tab) => page.locator(`.nav-item[data-tab=${tab}]`).click();
export const pill = (page, text) => page.locator('.pill', { hasText: text }).click();
export const btn = (page, name) => page.getByRole('button', { name, exact: true });
export const toast = page => page.locator('#toast');
export const saved = page => page.evaluate(k => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
export const lab = async (page, tab) => { await nav(page, 'tools'); await pill(page, tab); };
