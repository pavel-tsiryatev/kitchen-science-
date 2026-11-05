// Android-режим: Preferences вместо localStorage, «Поделиться» для резервной копии.
// Плагины Capacitor подменяются, хранилище Preferences имитируется объектом в памяти.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const prefs = new Map();
const calls = { set: 0, write: null, share: null };
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }));
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: async ({ key }) => ({ value: prefs.has(key) ? prefs.get(key) : null }),
    set: async ({ key, value }) => { calls.set++; prefs.set(key, value); },
  },
}));
vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' }, Encoding: { UTF8: 'utf8' },
  Filesystem: { writeFile: async o => { calls.write = o; return { uri: 'file:///cache/' + o.path }; } },
}));
vi.mock('@capacitor/share', () => ({ Share: { share: async o => { calls.share = o; } } }));

const KEY = 'kuhnya_science_v1';
let store, native;
beforeEach(async () => {
  prefs.clear(); localStorage.clear(); Object.assign(calls, { set: 0, write: null, share: null });
  document.body.innerHTML = '<div id="toast"></div>';
  vi.useFakeTimers();
  vi.resetModules();
  native = await import('../../src/native.js');
  store = await import('../../src/store.svelte.js');
});
afterEach(() => vi.useRealTimers());

describe('хранилище на Android', () => {
  it('миграция: данные старой версии из localStorage переносятся в Preferences', async () => {
    localStorage.setItem(KEY, JSON.stringify({ schema: 2, favIds: ['a2'], journal: [{ id: 1, dish: 'Старый хлеб' }] }));
    await store.loadState();
    expect(store.state.favIds).toEqual(['a2']);
    expect(store.state.journal[0].dish).toBe('Старый хлеб');
    expect(prefs.get(KEY)).toContain('Старый хлеб');
  });
  it('Preferences главнее localStorage', async () => {
    prefs.set(KEY, JSON.stringify({ schema: 2, favIds: ['b1'] }));
    localStorage.setItem(KEY, JSON.stringify({ schema: 2, favIds: ['a1'] }));
    await store.loadState();
    expect(store.state.favIds).toEqual(['b1']);
  });
  it('данные переживают очистку localStorage', async () => {
    store.state.favIds.push('c2'); store.saveState();
    await vi.advanceTimersByTimeAsync(400);
    localStorage.clear();
    vi.resetModules();
    const fresh = await import('../../src/store.svelte.js');
    await fresh.loadState();
    expect(fresh.state.favIds).toEqual(['c2']);
  });
  it('частые сохранения объединяются в одну запись', async () => {
    for (let i = 0; i < 5; i++) { store.state.targetPortions = String(i); store.saveState(); }
    expect(calls.set).toBe(0);
    await vi.advanceTimersByTimeAsync(400);
    expect(calls.set).toBe(1);
    expect(JSON.parse(prefs.get(KEY)).targetPortions).toBe('4');
  });
  it('сворачивание приложения сразу сбрасывает отложенную запись', async () => {
    store.state.targetPortions = '77'; store.saveState();
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);
    expect(JSON.parse(prefs.get(KEY)).targetPortions).toBe('77');
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });
});

describe('резервная копия на Android', () => {
  it('файл пишется во временную папку и открывается «Поделиться»', async () => {
    const how = await native.saveTextFile('kuhnya-backup.json', '{"a":1}');
    expect(how).toBe('shared');
    expect(calls.write).toMatchObject({ path: 'kuhnya-backup.json', directory: 'CACHE', data: '{"a":1}' });
    expect(calls.share.files).toEqual(['file:///cache/kuhnya-backup.json']);
  });
});
