// Кухонные таймеры: несколько одновременно, переживают перезапуск приложения.
// На Android дополнительно ставится системное уведомление на момент окончания.
import { scheduleTimerNotification, cancelTimerNotification } from './native.js';

const KEY = 'kuhnya_timers';
export const timers = $state({ list: [], now: Date.now() });

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (Array.isArray(v)) timers.list = v.filter(t => t && Number.isFinite(t.end) && typeof t.title === 'string').slice(0, 20);
  } catch (e) {}
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(timers.list)); } catch (e) {} }
load();

/** Запуск таймера: title — блюдо, label — «5 мин». Возвращает созданный таймер. */
export function startTimer({ title, label, seconds, articleId = null }, now = Date.now()) {
  const id = (now % 2_000_000_000) + timers.list.length; // id уведомления Android — 32-битное число
  const t = { id, title, label, seconds, end: now + seconds * 1000, done: false, articleId };
  timers.list = [...timers.list, t];
  persist();
  scheduleTimerNotification(id, `Таймер: ${title}`, `Прошло ${label}`, t.end);
  return t;
}

export function cancelTimer(id) {
  timers.list = timers.list.filter(t => t.id !== id);
  persist();
  cancelTimerNotification(id);
}

/** Сколько осталось, «4:05» или «1:02:30» */
export function fmtLeft(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = n => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** Обновляет «сейчас» и отмечает истёкшие таймеры. Возвращает только что закончившиеся. */
export function tick(now = Date.now()) {
  timers.now = now;
  const fired = timers.list.filter(t => !t.done && t.end <= now);
  if (fired.length) { for (const t of fired) t.done = true; persist(); }
  return fired;
}

/** Короткий сигнал и вибрация, когда таймер закончился и приложение открыто */
export function ring() {
  try { navigator.vibrate && navigator.vibrate([400, 200, 400, 200, 400]); } catch (e) {}
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.5, 1].forEach(at => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime + at); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + 0.4);
      o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + 0.4);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch (e) {}
}
