// Разбор раздела «Как применить на практике» на шаги для режима «Готовлю»
// и поиск времени в шаге для таймеров.
import { paragraphs } from './utils.js';

const clean = s => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

/**
 * Шаги рецепта: [{ section, n, text }]. Нумерованные пункты «1. … 2. …» становятся шагами,
 * текст перед «1.» («Крем:», «**Гречка** (2–3 порции):») — названием части,
 * абзацы без нумерации — отдельными шагами-пояснениями (n = null).
 */
export function parseSteps(practice) {
  const out = [];
  let section = '';
  for (const raw of paragraphs(practice || '')) {
    const p = clean(raw);
    // ищем маркеры 1., 2., 3. … строго по порядку, чтобы не принять «2. » внутри числа за шаг
    const marks = [];
    const re = /(^|\s)(\d{1,2})\.\s/g;
    let m, want = 1;
    while ((m = re.exec(p))) {
      // номер шага стоит в начале абзаца или после конца предложения: «… мм. 2. Промойте»
      const before = p.slice(0, m.index).trimEnd().slice(-1);
      if (Number(m[2]) === want && (want === 1 || /[.!?):»]/.test(before))) { marks.push({ at: m.index + m[1].length, len: m[2].length + 2 }); want++; }
    }
    if (!marks.length) {
      // «Крем:» — заголовок следующей части; остальное — пояснение
      if (/^[^.]{1,60}:$/.test(p)) { section = p.slice(0, -1); continue; }
      out.push({ section, n: null, text: p });
      continue;
    }
    const head = p.slice(0, marks[0].at).trim();
    if (head) section = head.replace(/:$/, '');
    marks.forEach((mk, i) => {
      const end = i + 1 < marks.length ? marks[i + 1].at : p.length;
      out.push({ section, n: i + 1, text: p.slice(mk.at + mk.len, end).trim() });
    });
  }
  return out;
}

const UNIT = /^(мин|минут|минуты|минуту)$/;
/**
 * Время в шаге для кнопок таймера: [{ label, seconds }].
 * «5–7 минут» → таймер на 5 минут (проверить раньше лучше, чем пережарить), «1–1,5 часа» → 1 ч.
 */
export function findTimers(text) {
  const out = [], seen = new Set();
  // \b в JS не работает с кириллицей, поэтому конец слова — «не буква»; «2 ч. л.» — это ложки, не часы
  const re = /(\d+(?:,\d+)?)(?:\s*[–-]\s*(\d+(?:,\d+)?))?\s*(минут[уы]?|мин(?![а-яё])|час(?:а|ов)?|ч(?![а-яё])(?!\.\s*л))(?![а-яё])/gi;
  let m;
  while ((m = re.exec(text))) {
    const a = parseFloat(m[1].replace(',', '.'));
    const min = UNIT.test(m[3].toLowerCase()) || /^мин/i.test(m[3]) ? a : a * 60;
    if (!min || min > 24 * 60 || seen.has(min)) continue;
    seen.add(min);
    const label = min < 60 ? `${fmt(min)} мин` : min % 60 ? `${Math.floor(min / 60)} ч ${fmt(min % 60)} мин` : `${min / 60} ч`;
    out.push({ label, seconds: Math.round(min * 60) });
  }
  return out;
}
const fmt = x => String(Math.round(x * 10) / 10).replace('.', ',');
