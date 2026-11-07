// Проверка новой версии: разбор ответа GitHub, интервал, «Не сейчас»
import { describe, it, expect, beforeEach } from 'vitest';
import { devNumber, newerSemver, pickUpdate, checkUpdate, skipVersion, APP_VERSION } from '../../src/update.js';

const apk = { name: 'kuhnya-dev.apk', browser_download_url: 'https://github.com/x/releases/download/dev/kuhnya-dev.apk' };
const dev = n => ({ tag_name: 'dev', name: `Тестовая сборка 1.0.0-dev.${n}`, body: `версия 1.0.0-dev.${n}`, assets: [apk] });

describe('версии', () => {
  it('номер тестовой сборки', () => {
    expect(devNumber('1.0.0-dev.57')).toBe(57);
    expect(devNumber('1.2.0')).toBeNull();
  });
  it('сравнение', () => {
    expect(newerSemver('v1.2.10', '1.2.9')).toBe(true);
    expect(newerSemver('1.2.0', '1.2.0')).toBe(false);
    expect(newerSemver('1.1.9', '1.2.0')).toBe(false);
  });
});

describe('ответ GitHub', () => {
  it('тестовая сборка новее — предлагаем', () => {
    expect(pickUpdate('1.0.0-dev.55', dev(57))).toEqual({ version: '1.0.0-dev.57', url: apk.browser_download_url });
  });
  it('та же или старее — нет', () => {
    expect(pickUpdate('1.0.0-dev.57', dev(57))).toBeNull();
    expect(pickUpdate('1.0.0-dev.60', dev(57))).toBeNull();
  });
  it('без APK или черновик — нет', () => {
    expect(pickUpdate('1.0.0-dev.1', { ...dev(5), assets: [] })).toBeNull();
    expect(pickUpdate('1.0.0-dev.1', { ...dev(5), draft: true })).toBeNull();
  });
  it('релизная версия сравнивается с тегом v*', () => {
    const rel = { tag_name: 'v1.1.0', name: 'Кухня 1.1.0', assets: [{ name: 'kuhnya-1.1.0.apk', browser_download_url: 'u' }] };
    expect(pickUpdate('1.0.0', rel)).toEqual({ version: '1.1.0', url: 'u' });
    expect(pickUpdate('1.1.0', rel)).toBeNull();
    expect(pickUpdate('1.0.0', dev(99))).toBeNull(); // «dev» не считается релизом
  });
});

describe('checkUpdate', () => {
  beforeEach(() => localStorage.clear());
  const rel = { tag_name: 'v9.0.0', assets: [{ name: 'k.apk', browser_download_url: 'u' }] };
  const fetchOk = body => async () => ({ ok: true, json: async () => body });

  it('в тестах версия берётся из package.json', () => expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+/));
  it('находит обновление и не проверяет чаще раза в 12 часов', async () => {
    expect(await checkUpdate({ fetchFn: fetchOk(rel), now: 1e12 })).toEqual({ version: '9.0.0', url: 'u' });
    expect(await checkUpdate({ fetchFn: fetchOk(rel), now: 1e12 + 3600e3 })).toBeNull();
    expect(await checkUpdate({ fetchFn: fetchOk(rel), now: 1e12 + 13 * 3600e3 })).not.toBeNull();
  });
  it('«Не сейчас» скрывает эту версию, кнопка проверки показывает', async () => {
    skipVersion('9.0.0');
    expect(await checkUpdate({ fetchFn: fetchOk(rel), now: 1 })).toBeNull();
    expect(await checkUpdate({ fetchFn: fetchOk(rel), now: 2, force: true })).not.toBeNull();
  });
  it('ошибки сети и HTTP не ломают приложение', async () => {
    expect(await checkUpdate({ fetchFn: async () => { throw new Error('offline'); }, force: true })).toBeNull();
    expect(await checkUpdate({ fetchFn: async () => ({ ok: false }), force: true })).toBeNull();
  });
});
