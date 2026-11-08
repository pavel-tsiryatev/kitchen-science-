// Свои рецепты пользователя: разбор строк ингредиентов, проверка сохранённых данных
// и превращение рецепта в «статью», с которой работают карточка ингредиентов,
// режим «Готовлю», меню и список покупок.

export const MY_PREFIX = 'u';
export const isMine = id => typeof id === 'string' && /^u\d{1,16}$/.test(id);

// Единицы в том виде, как их пишут люди → единица справочника
const UNIT_RE = [
  [/^(г|гр|грамм(а|ов)?)$/, 'г'],
  [/^(кг|килограмм(а|ов)?)$/, 'кг'],
  [/^(мл|миллилитр(а|ов)?)$/, 'мл'],
  [/^(л|литр(а|ов)?)$/, 'л'],
  [/^(шт|штук[аи]?|штук)$/, 'шт'],
  [/^(ст\.?\s*л|ст\.?\s*ложк[аи]|ст\.?\s*ложек|столов(ая|ые|ых)\s+лож(ка|ки|ек))$/, 'ст. л.'],
  [/^(ч\.?\s*л|ч\.?\s*ложк[аи]|ч\.?\s*ложек|чайн(ая|ые|ых)\s+лож(ка|ки|ек))$/, 'ч. л.'],
  [/^стакан(а|ов)?$/, 'стакан'],
  [/^зубч(ик|ика|иков)$/, 'зубчик'],
  [/^(пучок|пучка|пучков)$/, 'пучок'],
  [/^(банка|банки|банок)$/, 'банка'],
];
const FREE = /^(по вкусу|щепотка|щепотку|для жарки|для подачи|по желанию|немного)$/;
const FRAC = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };

function num(s) {
  s = s.trim();
  const m = /^(\d+)?\s*([½¼¾⅓⅔])$/.exec(s);
  if (m) return (m[1] ? Number(m[1]) : 0) + FRAC[m[2]];
  const f = /^(\d+)\/(\d+)$/.exec(s);
  if (f) return Number(f[2]) ? Number(f[1]) / Number(f[2]) : NaN;
  return Number(s.replace(',', '.'));
}

function unitOf(s) {
  const t = s.trim().toLowerCase().replace(/\.$/, '').replace(/\s+/g, ' ');
  for (const [re, u] of UNIT_RE) if (re.test(t)) return u;
  return null;
}

/**
 * Строка ингредиента → { name, qty, unit } или null для пустой строки.
 * Понимает «Мука — 200 г», «Мука: 200 г», «Мука 200 г», «Яйца 2–3 шт», «Молоко 1,5 стакана»,
 * «Сахар ½ ст. л.», «Соль по вкусу», «Лавровый лист» (без количества → «по вкусу»).
 */
export function parseIngredientLine(line) {
  const s = String(line || '').replace(/^[\s•\-–—*·]+/, '').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  const free = /^(.+?)\s*[—–:-]?\s*(по вкусу|щепотка|щепотку|для жарки|для подачи|по желанию|немного)$/i.exec(s);
  if (free) return { name: cap(free[1]), qty: null, unit: free[2].toLowerCase() };
  const N = '(\\d+(?:[.,]\\d+)?(?:\\s*[½¼¾⅓⅔])?|[½¼¾⅓⅔]|\\d+\\/\\d+)';
  // название — самое длинное, которое кончается не цифрой: «Молоко 3,2 % — 1 л», «Яйца 2–3 шт»
  const m = new RegExp(`^(.*[^\\d\\s.,:/–—-])\\s*[—–:-]?\\s*${N}(?:\\s*[–—-]\\s*${N})?\\s*([^\\d½¼¾⅓⅔]*)$`).exec(s);
  if (m) {
    const unit = m[4] ? unitOf(m[4]) : 'шт';
    const a = num(m[2]), b = m[3] ? num(m[3]) : null;
    if (unit && Number.isFinite(a) && a > 0 && (b === null || (Number.isFinite(b) && b > a))) {
      return { name: cap(m[1].replace(/[—–:,-]+$/, '').trim()), qty: b === null ? round(a) : [round(a), round(b)], unit };
    }
  }
  return { name: cap(s), qty: null, unit: 'по вкусу' };
}
const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
const round = x => Math.round(x * 1000) / 1000;

/** Количество и единица обратно в строку для редактирования: «Мука — 200 г» */
export function ingredientLine(it) {
  if (it.qty === null) return `${it.name} — ${it.unit}`;
  const n = x => String(x).replace('.', ',');
  const q = Array.isArray(it.qty) ? `${n(it.qty[0])}–${n(it.qty[1])}` : n(it.qty);
  return `${it.name} — ${q} ${it.unit}`;
}

/** Шаги из текста: каждая непустая строка — шаг; «1.» или «1)» в начале убирается */
export function parseStepsText(text) {
  return String(text || '').split('\n').map(l => l.replace(/^\s*\d{1,2}[.)]\s*/, '').trim()).filter(Boolean).slice(0, 40);
}

const okQty = q => q === null || (typeof q === 'number' && Number.isFinite(q) && q > 0 && q < 1e6) ||
  (Array.isArray(q) && q.length === 2 && q.every(v => typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 1e6) && q[1] > q[0]);

/** Проверка сохранённого списка своих рецептов (из памяти или резервной копии) */
export function sanitizeMyRecipes(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set(), out = [];
  for (const r of list.slice(0, 200)) {
    if (!r || typeof r !== 'object' || !isMine(r.id) || seen.has(r.id)) continue;
    const title = String(r.title ?? '').trim().slice(0, 120);
    if (!title) continue;
    const servings = Number.isInteger(r.servings) ? Math.min(50, Math.max(1, r.servings)) : 2;
    const items = (Array.isArray(r.items) ? r.items : []).slice(0, 60)
      .filter(x => x && typeof x.name === 'string' && x.name.trim() && typeof x.unit === 'string' && okQty(x.qty ?? null))
      .map(x => ({ name: x.name.trim().slice(0, 80), qty: x.qty ?? null, unit: x.unit.slice(0, 24) }));
    const steps = (Array.isArray(r.steps) ? r.steps : []).filter(x => typeof x === 'string' && x.trim()).slice(0, 40).map(x => x.trim().slice(0, 1000));
    seen.add(r.id);
    out.push({ id: r.id, title, servings, items, steps });
  }
  return out;
}

const asArticle = new WeakMap();
/** Свой рецепт в виде «статьи» для общих экранов (кэшируется на объект рецепта) */
export function recipeArticle(r) {
  if (!asArticle.has(r)) {
    asArticle.set(r, {
      id: r.id, sec: 'I', mine: true, title: r.title, idea: '',
      ingredients: r.items.length ? { servings: r.servings, items: r.items } : null,
      steps: r.steps.map((text, i) => ({ section: '', n: i + 1, text })),
    });
  }
  return asArticle.get(r);
}

/** Новый id для рецепта */
export const newRecipeId = (now = Date.now()) => MY_PREFIX + now;
