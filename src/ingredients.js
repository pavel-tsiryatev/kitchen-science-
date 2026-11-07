// Ингредиенты рецептов: пересчёт на другое число порций, красивый вывод количества
// и объединение одинаковых продуктов в списке покупок.
//
// Количество — число, диапазон [от, до] или null («по вкусу», «щепотка», «для жарки»).

/** Умножает количество на коэффициент (null остаётся null) */
export function scaleQty(qty, k) {
  if (qty === null || qty === undefined) return null;
  return Array.isArray(qty) ? [qty[0] * k, qty[1] * k] : qty * k;
}

// Граммы и миллилитры храним как основные единицы, килограммы и литры — только для показа
const BASE = { 'кг': ['г', 1000], 'л': ['мл', 1000] };
/** Приводит к основной единице: 1,2 кг → 1200 г */
export function toBase(qty, unit) {
  const b = BASE[unit];
  return b ? [scaleQty(qty, b[1]), b[0]] : [qty, unit];
}

// Шаг округления: ложки — до четверти, штуки и стаканы — до половины, граммы — до 5 или 10
function round(x, unit) {
  if (unit === 'г' || unit === 'мл') return x < 10 ? Math.round(x * 2) / 2 : x < 100 ? Math.round(x / 5) * 5 : Math.round(x / 10) * 10;
  if (unit === 'ст. л.' || unit === 'ч. л.') return Math.max(0.25, Math.round(x * 4) / 4);
  if (unit === 'кг' || unit === 'л') return Math.round(x * 10) / 10;
  return x < 3 ? Math.max(0.5, Math.round(x * 2) / 2) : Math.round(x);
}

const FRACTIONS = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
/** Число по-русски: 1½, ¼, 2,5 (для граммов и литров — с запятой) */
export function fmtNum(x, unit) {
  const whole = Math.floor(x), frac = Math.round((x - whole) * 100) / 100;
  if (frac && FRACTIONS[frac] && !['г', 'мл', 'кг', 'л'].includes(unit)) return (whole ? String(whole) : '') + FRACTIONS[frac];
  return String(Math.round(x * 100) / 100).replace('.', ',');
}

// Склонение единиц после числа: 1 зубчик, 2 зубчика, 5 зубчиков; после дроби — «зубчика»
const FORMS = { 'зубчик': ['зубчик', 'зубчика', 'зубчиков'], 'стакан': ['стакан', 'стакана', 'стаканов'], 'пучок': ['пучок', 'пучка', 'пучков'], 'банка': ['банка', 'банки', 'банок'] };
export function unitFor(x, unit) {
  const f = FORMS[unit]; if (!f) return unit;
  if (!Number.isInteger(x)) return f[1];
  const n = x % 100, d = x % 10;
  if (n >= 11 && n <= 14) return f[2];
  return d === 1 ? f[0] : d >= 2 && d <= 4 ? f[1] : f[2];
}

/** «600–700 г», «1½ ст. л.», «1,2 кг», «по вкусу» */
export function fmtQty(qty, unit) {
  if (qty === null || qty === undefined) return unit;
  let [q, u] = toBase(qty, unit);
  const top = Array.isArray(q) ? q[1] : q;
  // крупные количества показываем в килограммах и литрах
  if ((u === 'г' || u === 'мл') && top >= 1000) { q = scaleQty(q, 1 / 1000); u = u === 'г' ? 'кг' : 'л'; }
  if (Array.isArray(q)) {
    const a = round(q[0], u), b = round(q[1], u);
    if (a === b) return `${fmtNum(a, u)} ${unitFor(a, u)}`;
    return `${fmtNum(a, u)}–${fmtNum(b, u)} ${unitFor(b, u)}`;
  }
  const r = round(q, u);
  return `${fmtNum(r, u)} ${unitFor(r, u)}`;
}

/** Ингредиенты на нужное число порций */
export function scaleIngredients(ing, servings) {
  const k = servings / ing.servings;
  return ing.items.map(it => ({ ...it, qty: scaleQty(it.qty, k) }));
}

// --- список покупок ---
/** Ключ продукта: название без пояснения в скобках + единица. «Мука (в крем)» и «Мука» — один продукт. */
export function itemKey(name, unit) {
  return name.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase().replace(/ё/g, 'е') + '|' + unit;
}

function addQty(a, b) {
  if (a === null || b === null) return a === null ? b : a;
  const lo = x => (Array.isArray(x) ? x[0] : x), hi = x => (Array.isArray(x) ? x[1] : x);
  return Array.isArray(a) || Array.isArray(b) ? [lo(a) + lo(b), hi(a) + hi(b)] : a + b;
}

/**
 * Добавляет ингредиенты рецепта в список. Одинаковые продукты складываются,
 * купленные снова становятся некупленными. Возвращает новый список.
 */
export function addToList(list, items, src) {
  const out = list.map(x => ({ ...x, src: [...(x.src || [])] }));
  for (const it of items) {
    const [qty, unit] = toBase(it.qty, it.unit);
    const name = it.name.replace(/\s*\([^)]*\)/g, '').trim();
    const key = itemKey(name, unit);
    const ex = out.find(x => x.key === key);
    if (ex) {
      ex.qty = ex.qty === null && qty === null ? null : addQty(ex.qty, qty);
      ex.done = false;
      if (src && !ex.src.includes(src)) ex.src.push(src);
    } else out.push({ key, name, qty, unit, done: false, src: src ? [src] : [] });
  }
  return out;
}

/** Текст списка для «Поделиться»: сначала некупленное */
export function listText(list) {
  const line = x => `${x.done ? '✓' : '•'} ${x.name}${x.qty === null && (x.unit === 'по вкусу' || !x.unit) ? '' : ' — ' + fmtQty(x.qty, x.unit)}`;
  return ['Список покупок', ...list.filter(x => !x.done).map(line), ...list.filter(x => x.done).map(line)].join('\n');
}
