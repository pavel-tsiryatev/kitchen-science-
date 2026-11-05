// Экспорт и импорт резервной копии (веб-режим)
import { describe, it, expect, beforeEach, vi } from 'vitest';

let store, backup, area;
const toastText = () => document.getElementById('toast').textContent;
beforeEach(async () => {
  localStorage.clear();
  document.body.innerHTML = '<div id="toast"></div><textarea id="a"></textarea>';
  area = document.getElementById('a');
  window.confirm = () => true;
  vi.resetModules();
  store = await import('../../src/store.svelte.js');
  backup = await import('../../src/backup.js');
});

describe('экспорт', () => {
  it('в поле появляется корректный JSON со всеми данными', () => {
    document.execCommand = () => true;
    store.state.favIds.push('a1');
    backup.exportBackup(area);
    const obj = JSON.parse(area.value);
    expect(obj.app).toBe('kuhnya-nauka-vkusa');
    expect(obj.data.favIds).toEqual(['a1']);
    expect(obj.data.schema).toBe(store.SCHEMA);
  });
});

describe('импорт из поля', () => {
  const copy = data => JSON.stringify({ app: 'kuhnya-nauka-vkusa', data: { schema: 2, ...data } });

  it('восстанавливает данные, очищает поле и сохраняет', () => {
    area.value = copy({ favIds: ['b2'], theme: 'dark' });
    backup.importBackup(area);
    expect(store.state.favIds).toEqual(['b2']);
    expect(store.state.theme).toBe('dark');
    expect(area.value).toBe('');
    expect(JSON.parse(localStorage.getItem(store.STORAGE_KEY)).favIds).toEqual(['b2']);
    expect(toastText()).toBe('Данные импортированы');
  });
  it('принимает и «голые» данные без обёртки', () => {
    area.value = JSON.stringify({ schema: 2, readIds: ['a1'] });
    backup.importBackup(area);
    expect(store.state.readIds).toEqual(['a1']);
  });
  it.each([
    ['', 'Вставьте JSON'],
    ['{битый', 'Это не JSON'],
    [JSON.stringify({ data: { schema: 99 } }), 'более новой версией'],
    [JSON.stringify({ foo: 1 }), 'не найдено данных'],
  ])('ошибка «%s» → понятное сообщение', (txt, msg) => {
    area.value = txt;
    backup.importBackup(area);
    expect(toastText()).toContain(msg);
    expect(store.state.favIds).toEqual([]);
  });
  it('отказ в подтверждении ничего не меняет', () => {
    window.confirm = () => false;
    area.value = copy({ favIds: ['b2'] });
    backup.importBackup(area);
    expect(store.state.favIds).toEqual([]);
  });
});

describe('импорт из файла', () => {
  it('слишком большой файл отклоняется', () => {
    const input = { files: [{ size: 6e6 }], value: 'x' };
    backup.importBackupFile(input, area);
    expect(toastText()).toContain('слишком большой');
    expect(input.value).toBe('');
  });
  it('содержимое файла импортируется', async () => {
    const file = new File([JSON.stringify({ data: { schema: 2, favIds: ['c1'] } })], 'b.json', { type: 'application/json' });
    backup.importBackupFile({ files: [file], value: '' }, area);
    await vi.waitFor(() => expect(store.state.favIds).toEqual(['c1']));
  });
});

describe('сброс прогресса', () => {
  it('убирает прочитанное и ответы, но не журнал и избранное', () => {
    Object.assign(store.state, { readIds: ['a1'], quizScores: { a1: 0 }, favIds: ['a2'] });
    backup.resetProgress();
    expect(store.state.readIds).toEqual([]);
    expect(store.state.quizScores).toEqual({});
    expect(store.state.favIds).toEqual(['a2']);
    expect(store.state.journal).toHaveLength(1);
  });
});
