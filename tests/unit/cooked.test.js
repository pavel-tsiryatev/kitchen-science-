// «Приготовил» и история
import { describe, it, expect } from 'vitest';
import { addCooked, cookedStats, staleFavorites, sanitizeCooked, daysSince, fmtDate, today } from '../../src/cooked.js';

const now = new Date(2026, 10, 8); // 8 ноября 2026

describe('история приготовленного', () => {
  it('добавление: новые сверху, повтор в тот же день обновляет оценку', () => {
    let l = addCooked([], 'i1', 4, '2026-11-01');
    l = addCooked(l, 'i2', null, '2026-11-02');
    l = addCooked(l, 'i1', 5, '2026-11-01');
    expect(l).toEqual([{ id: 'i1', date: '2026-11-01', rating: 5 }, { id: 'i2', date: '2026-11-02', rating: null }]);
    expect(addCooked([], 'i1', 9, '2026-11-01')[0].rating).toBeNull();
  });
  it('сводка по блюду', () => {
    const l = [{ id: 'i1', date: '2026-11-05', rating: null }, { id: 'i1', date: '2026-10-01', rating: 4 }, { id: 'i2', date: '2026-11-01', rating: 2 }];
    expect(cookedStats(l, 'i1')).toEqual({ times: 2, last: '2026-11-05', rating: 4 });
    expect(cookedStats(l, 'i9')).toBeNull();
  });
  it('давно не готовили: понравившиеся и старые, сначала самые давние', () => {
    const l = [
      { id: 'i1', date: '2026-10-01', rating: 5 },
      { id: 'i2', date: '2026-11-07', rating: 5 }, // недавно
      { id: 'i3', date: '2026-09-01', rating: 2 }, // не понравилось
      { id: 'i4', date: '2026-08-01', rating: null }, { id: 'i4', date: '2026-07-01', rating: null }, // дважды
      { id: 'u9', date: '2026-08-01', rating: 5 },
    ];
    expect(staleFavorites(l, { now, exists: id => id !== 'u9' }).map(x => x.id)).toEqual(['i4', 'i1']);
  });
  it('даты', () => {
    expect(daysSince('2026-11-01', now)).toBe(7);
    expect(fmtDate('2026-11-08', now)).toBe('сегодня');
    expect(fmtDate('2026-11-07', now)).toBe('вчера');
    expect(fmtDate('2026-11-03', now)).toBe('3 нояб.');
    expect(fmtDate('2025-05-03', now)).toBe('3 мая 2025');
    expect(today(now)).toBe('2026-11-08');
  });
  it('проверка сохранённого', () => {
    const l = sanitizeCooked([{ id: 'i1', date: '2026-11-01', rating: 3 }, { id: 'i1', date: '2026-11-01', rating: 4 }, { id: 'zz', date: '2026-11-01' }, { id: 'i2', date: 'вчера' }, { id: 'i2', date: '2026-11-02', rating: 7 }, null], id => /^i\d+$/.test(id));
    expect(l).toEqual([{ id: 'i1', date: '2026-11-01', rating: 3 }, { id: 'i2', date: '2026-11-02', rating: null }]);
    expect(sanitizeCooked('x', () => true)).toEqual([]);
  });
});
