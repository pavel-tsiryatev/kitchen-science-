import { ARTICLES } from './data/index.js';
import { toast } from './toast.js';
import { isNative, readStored, writeStoredNative } from './native.js';

// Реактивное состояние приложения (Svelte 5 $state), загрузка/сохранение в localStorage, тема и шрифт
export const STORAGE_KEY = 'kuhnya_science_v1';
export const state = $state({
  tab: 'home',
  subTab: 'calc', // calc | trouble | compare
  labTab: 'quiz', // quiz | journal
  secFilter: 'ALL',
  dishGroup: 'ALL', // подгруппа в разделе «Популярные блюда»
  shopping: [], // список покупок: { key, name, qty, unit, done, src }
  notes: {}, // свои заметки к статьям: { id: текст }
  fridge: [], // продукты для «Что приготовить» (id из src/data/products.json)
  servingsFor: {}, // выбранное число порций по статьям (не сохраняется)
  collectionId: null, // открытая подборка
  searchQuery: '',
  currentArticleId: null,
  glossTerm: null, // термин, к которому прокрутить экран глоссария
  theme: 'light',
  fontScale: 1,
  readIds: [],
  favIds: [],
  quizScores: {},
  journal: [
    {
      id: 1700000001,
      date: 'Образец записи',
      dish: 'Подовый пшеничный хлеб (гидратация 72%)',
      ing: 'Мука в/с (12.5% белка) — 500 г (100%), Вода — 360 г (72%), Закваска — 100 г (20%), Соль — 10 г (2%)',
      temp: 'Аутолиз 40 мин, брожение 4 ч при 26°C, ретардация 14 ч при +4°C, выпечка 240°C под колпаком 20 мин + 210°C без крышки 18 мин',
      result: 'Отличный печной подъём, тонкая хрустящая корка с блистерами, открытый кружевной мякиш.',
      next: 'В следующий раз заменить 15% муки на цельнозерновую и увеличить гидратацию до 75%.'
    }
  ],
  // Калькулятор рецептов
  calcMode: 'portions', // portions | baker
  basePortions: 4,
  targetPortions: 6,
  recipeItems: [
    { name: 'Мука пшеничная', amount: 400, unit: 'г' },
    { name: 'Молоко 3.2%', amount: 250, unit: 'мл' },
    { name: 'Масло сливочное', amount: 80, unit: 'г' },
    { name: 'Сахар', amount: 60, unit: 'г' },
    { name: 'Соль', amount: 8, unit: 'г' }
  ],
  bakerFlour: 500,
  jDraft: { dish:'', ing:'', temp:'', res:'', next:'' }, jEditId: null, recentIds: [],
  bakerItems: [
    { name: 'Вода (гидратация)', pct: 70 },
    { name: 'Закваска / Опара', pct: 20 },
    { name: 'Соль', pct: 2.0 },
    { name: 'Солод / Масло', pct: 3.0 }
  ]
});

export function applyThemeAndFont() {
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.style.setProperty('--font-scale', state.fontScale);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', state.theme === 'dark' ? '#181716' : '#FBF8F3');
}

export const SCHEMA = 2;

let storageOk = true, pendingMsg = '';
export function getPendingMsg() { return pendingMsg; }

export function sanitizeSaved(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return null;
  const ids = new Set(ARTICLES.map(a => a.id)), o = {}, isA = Array.isArray;
  const ns = v => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? String(n) : ''; };
  const st = (v, n) => String(v == null ? '' : v).slice(0, n);
  const obj = x => x && typeof x === 'object' && !isA(x);
  if (s.theme === 'dark' || s.theme === 'light') o.theme = s.theme;
  const fs = parseFloat(s.fontScale); if (Number.isFinite(fs)) o.fontScale = Math.min(1.4, Math.max(0.85, fs));
  if (isA(s.readIds)) o.readIds = [...new Set(s.readIds.filter(x => ids.has(x)))];
  if (isA(s.favIds)) o.favIds = [...new Set(s.favIds.filter(x => ids.has(x)))];
  if (obj(s.quizScores)) { o.quizScores = {}; for (const a of ARTICLES) { const v = s.quizScores[a.id]; if (Number.isInteger(v) && v >= 0 && v < a.quiz.opts.length) o.quizScores[a.id] = v; } }
  if (isA(s.journal)) {
    const seen = new Set();
    o.journal = s.journal.slice(0, 500).filter(obj).map((x, i) => {
      let id = Number.isFinite(+x.id) ? +x.id : Date.now() + i; while (seen.has(id)) id++; seen.add(id);
      return { id, date: st(x.date, 40), dish: st(x.dish, 200), ing: st(x.ing, 2000), temp: st(x.temp, 2000), result: st(x.result, 2000), next: st(x.next, 2000) };
    });
  }
  if (isA(s.recipeItems)) o.recipeItems = s.recipeItems.slice(0, 60).filter(obj).map(x => ({ name: st(x.name, 80), amount: ns(x.amount), unit: ['г', 'мл', 'шт'].includes(x.unit) ? x.unit : 'г' }));
  if (isA(s.bakerItems)) o.bakerItems = s.bakerItems.slice(0, 60).filter(obj).map(x => ({ name: st(x.name, 80), pct: ns(x.pct) }));
  if (isA(s.recentIds)) o.recentIds = [...new Set(s.recentIds.filter(x => ids.has(x)))].slice(0, 6);
  if (isA(s.shopping)) {
    const okQty = q => q === null || (typeof q === 'number' && Number.isFinite(q) && q > 0) || (isA(q) && q.length === 2 && q.every(v => typeof v === 'number' && Number.isFinite(v) && v > 0));
    const keys = new Set();
    o.shopping = s.shopping.slice(0, 300).filter(x => obj(x) && typeof x.name === 'string' && x.name.trim() && typeof x.unit === 'string' && okQty(x.qty ?? null)).map(x => {
      const name = st(x.name, 120).trim(), unit = st(x.unit, 24);
      let key = typeof x.key === 'string' && x.key ? st(x.key, 160) : name.toLowerCase() + '|' + unit;
      while (keys.has(key)) key += '+'; keys.add(key);
      return { key, name, qty: x.qty ?? null, unit, done: x.done === true, src: isA(x.src) ? x.src.filter(id => ids.has(id)).slice(0, 20) : [] };
    });
  }
  if (obj(s.notes)) { o.notes = {}; for (const [k, v] of Object.entries(s.notes)) if (ids.has(k) && typeof v === 'string' && v.trim()) o.notes[k] = v.slice(0, 2000); }
  if (isA(s.fridge)) o.fridge = [...new Set(s.fridge.filter(x => typeof x === 'string' && /^[a-z_-]{1,30}$/.test(x)))].slice(0, 100);
  ['bakerFlour', 'basePortions', 'targetPortions'].forEach(k => { if (s[k] !== undefined) o[k] = ns(s[k]); });
  return o;
}
export function snapshot() {
  return { schema: SCHEMA, theme: state.theme, fontScale: state.fontScale, readIds: state.readIds, favIds: state.favIds, quizScores: state.quizScores, journal: state.journal, recipeItems: state.recipeItems, bakerFlour: state.bakerFlour, bakerItems: state.bakerItems, basePortions: state.basePortions, targetPortions: state.targetPortions, recentIds: state.recentIds, shopping: state.shopping, notes: state.notes, fridge: state.fridge };
}
export async function loadState() {
  let raw = null;
  try {
    if (!isNative) { localStorage.setItem(STORAGE_KEY + '_t', '1'); localStorage.removeItem(STORAGE_KEY + '_t'); }
    raw = await readStored(STORAGE_KEY);
  } catch (e) { storageOk = false; pendingMsg = 'Хранилище недоступно: данные не сохранятся после закрытия. Используйте экспорт.'; }
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schema > SCHEMA) throw new Error('newer');
      const clean = sanitizeSaved(parsed); if (!clean) throw new Error('shape');
      Object.assign(state, clean);
    } catch (e) {
      try { localStorage.setItem(STORAGE_KEY + '_corrupt', raw); } catch (_) {}
      pendingMsg = 'Сохранённые данные не удалось прочитать. Копия отложена отдельно, приложение запущено с чистого листа.';
    }
  } else if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) state.theme = 'dark';
  applyThemeAndFont();
}
function storageFailed() {
  if (storageOk) { storageOk = false; toast('Не удалось сохранить: хранилище недоступно. Сделайте экспорт.'); }
}
export function saveState() {
  const json = JSON.stringify(snapshot());
  if (isNative) {
    // Основная копия — Preferences (асинхронно), localStorage — запасное зеркало
    try { localStorage.setItem(STORAGE_KEY, json); } catch (e) {}
    writeStoredNative(STORAGE_KEY, json, storageFailed);
    return storageOk;
  }
  try { localStorage.setItem(STORAGE_KEY, json); storageOk = true; return true; }
  catch (e) { storageFailed(); return false; }
}

export function setTheme(t) { state.theme = t; applyThemeAndFont(); saveState(); }

export function setFontScale(v) { state.fontScale = v; applyThemeAndFont(); saveState(); }
