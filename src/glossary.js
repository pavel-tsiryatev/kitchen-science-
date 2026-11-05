// Термины глоссария в тексте статей: поиск упоминаний в любой грамматической форме
import { stem, norm } from './search.js';

const WORD_RE = /[\p{L}\p{N}]+/gu;
const stemsOf = s => (norm(s).match(WORD_RE) || []).map(stem);

/** Готовит шаблоны: для каждого термина и синонима — последовательность основ слов */
export function compileGlossary(glossary) {
  const patterns = [];
  for (const t of glossary) for (const name of [t.term, ...t.aliases]) {
    const st = stemsOf(name);
    if (st.length) patterns.push({ id: t.id, stems: st });
  }
  // длинные фразы проверяем первыми («реакция Майяра» раньше, чем «Майяр»)
  return patterns.sort((a, b) => b.stems.length - a.stems.length);
}

/**
 * Делит текст на куски [{ text }, { text, term }]: ссылкой становится первое упоминание
 * каждого термина. `used` — общий набор для всей статьи, чтобы термин не повторялся.
 */
export function linkTerms(text, patterns, used = new Set()) {
  const src = String(text || '');
  const words = [...src.matchAll(WORD_RE)].map(m => ({ i: m.index, end: m.index + m[0].length, s: stem(norm(m[0])) }));
  const out = [];
  let last = 0;
  for (let w = 0; w < words.length; w++) {
    const p = patterns.find(p => !used.has(p.id) && p.stems.every((st, k) => words[w + k]?.s === st));
    if (!p) continue;
    const from = words[w].i, to = words[w + p.stems.length - 1].end;
    if (from > last) out.push({ text: src.slice(last, from) });
    out.push({ text: src.slice(from, to), term: p.id });
    used.add(p.id);
    last = to;
    w += p.stems.length - 1;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  return out;
}

/** Термины, подходящие под поисковый запрос: сначала точные совпадения основ, затем по началу слова */
export function searchGlossary(glossary, queryStems) {
  if (!queryStems.length) return [];
  const scored = [];
  for (const t of glossary) {
    const st = [t.term, ...t.aliases].flatMap(stemsOf);
    let exact = 0, ok = true;
    for (const q of queryStems) {
      if (st.includes(q)) exact++;
      else if (!(q.length >= 4 && st.some(s => s.startsWith(q)))) { ok = false; break; }
    }
    if (ok) scored.push([exact, t]);
  }
  return scored.sort((a, b) => b[0] - a[0]).map(([, t]) => t);
}
