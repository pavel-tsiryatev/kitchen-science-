// Кухонные таймеры
import { describe, it, expect, beforeEach, vi } from 'vitest';

let T;
beforeEach(async () => { localStorage.clear(); vi.resetModules(); T = await import('../../src/timers.svelte.js'); });

describe('таймеры', () => {
  it('формат оставшегося времени', () => {
    expect(T.fmtLeft(299_100)).toBe('5:00');
    expect(T.fmtLeft(61_000)).toBe('1:01');
    expect(T.fmtLeft(3_725_000)).toBe('1:02:05');
    expect(T.fmtLeft(-5)).toBe('0:00');
  });
  it('запуск, срабатывание и остановка; сохраняются между запусками', async () => {
    const t = T.startTimer({ title: 'Гречка', label: '15 мин', seconds: 900, articleId: 'i6' }, 1000);
    expect(T.tick(1000 + 899_000)).toEqual([]);
    const fired = T.tick(1000 + 900_000);
    expect(fired.map(x => x.title)).toEqual(['Гречка']);
    expect(T.tick(1000 + 901_000)).toEqual([]); // второй раз не срабатывает
    vi.resetModules();
    const T2 = await import('../../src/timers.svelte.js');
    expect(T2.timers.list).toHaveLength(1);
    T2.cancelTimer(t.id);
    expect(T2.timers.list).toHaveLength(0);
  });
});
