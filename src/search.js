// Поиск по справочнику: русский стемминг (Snowball), ранжирование, подсветка и фрагмент текста.
// Модуль без зависимостей от интерфейса — его удобно тестировать отдельно.

// ---------- Стеммер Snowball для русского языка ----------
// https://snowballstem.org/algorithms/russian/stemmer.html
const VOWELS = 'аеиоуыэюя';
const isV = c => VOWELS.includes(c);

const PERFECTIVE_1 = ['вшись', 'вши', 'в']; // после а/я
const PERFECTIVE_2 = ['ившись', 'ывшись', 'ивши', 'ывши', 'ив', 'ыв'];
const REFLEXIVE = ['ся', 'сь'];
const ADJECTIVE = ['ими', 'ыми', 'его', 'ого', 'ему', 'ому', 'ее', 'ие', 'ые', 'ое', 'ей', 'ий', 'ый', 'ой', 'ем', 'им', 'ым', 'ом', 'их', 'ых', 'ую', 'юю', 'ая', 'яя', 'ою', 'ею'];
const PARTICIPLE_1 = ['ем', 'нн', 'вш', 'ющ', 'щ']; // после а/я
const PARTICIPLE_2 = ['ивш', 'ывш', 'ующ'];
const VERB_1 = ['ете', 'йте', 'ешь', 'нно', 'ла', 'на', 'ли', 'ем', 'ло', 'но', 'ет', 'ют', 'ны', 'ть', 'й', 'л', 'н']; // после а/я
const VERB_2 = ['ейте', 'уйте', 'ила', 'ыла', 'ена', 'ите', 'или', 'ыли', 'ило', 'ыло', 'ено', 'ует', 'уют', 'ены', 'ить', 'ыть', 'ишь', 'ей', 'уй', 'ил', 'ыл', 'им', 'ым', 'ен', 'ят', 'ит', 'ыт', 'ую', 'ю'];
const NOUN = ['иями', 'ями', 'ами', 'ией', 'иям', 'ием', 'иях', 'ев', 'ов', 'ие', 'ье', 'еи', 'ии', 'ей', 'ой', 'ий', 'ям', 'ем', 'ам', 'ом', 'ах', 'ях', 'ию', 'ью', 'ия', 'ья', 'а', 'е', 'и', 'й', 'о', 'у', 'ы', 'ь', 'ю', 'я'];
const SUPERLATIVE = ['ейше', 'ейш'];
const DERIVATIONAL = ['ость', 'ост'];

const byLen = list => [...list].sort((a, b) => b.length - a.length);
const [P1, P2, ADJ, PA1, PA2, V1, V2, N, SUP, DER] = [PERFECTIVE_1, PERFECTIVE_2, ADJECTIVE, PARTICIPLE_1, PARTICIPLE_2, VERB_1, VERB_2, NOUN, SUPERLATIVE, DERIVATIONAL].map(byLen);

/** Отрезает самое длинное окончание из списка, если оно целиком в области `from`.
 *  afterAYa: окончание должно идти сразу после «а» или «я» (они сами остаются). */
function cut(word, from, list, afterAYa = false) {
  for (const s of list) {
    if (!word.endsWith(s)) continue;
    const at = word.length - s.length;
    if (at < from) continue;
    if (afterAYa && !(at - 1 >= from && (word[at - 1] === 'а' || word[at - 1] === 'я'))) continue;
    return word.slice(0, at);
  }
  return null;
}
const cutAny = (w, from, g1, g2) => cut(w, from, g1, true) ?? cut(w, from, g2);

function regions(w) {
  let rv = w.length, r1 = w.length, r2 = w.length;
  for (let i = 0; i < w.length; i++) if (isV(w[i])) { rv = i + 1; break; }
  for (let i = 1; i < w.length; i++) if (!isV(w[i]) && isV(w[i - 1])) { r1 = i + 1; break; }
  for (let i = r1 + 1; i < w.length; i++) if (!isV(w[i]) && isV(w[i - 1])) { r2 = i + 1; break; }
  return { rv, r2 };
}

export function stem(word) {
  let w = String(word).toLowerCase().replace(/ё/g, 'е');
  if (!/^[а-я]+$/.test(w)) return w;
  const { rv, r2 } = regions(w);

  // Шаг 1
  let r = cutAny(w, rv, P1, P2);
  if (r !== null) w = r;
  else {
    w = cut(w, rv, REFLEXIVE) ?? w;
    r = cut(w, rv, ADJ);
    if (r !== null) w = cutAny(r, rv, PA1, PA2) ?? r;
    else {
      r = cutAny(w, rv, V1, V2);
      if (r !== null) w = r;
      else w = cut(w, rv, N) ?? w;
    }
  }
  // Шаг 2
  if (w.endsWith('и') && w.length - 1 >= rv) w = w.slice(0, -1);
  // Шаг 3
  w = cut(w, r2, DER) ?? w;
  // Шаг 4
  if (w.endsWith('нн') && w.length - 2 >= rv) w = w.slice(0, -1);
  else {
    r = cut(w, rv, SUP);
    if (r !== null) { w = r; if (w.endsWith('нн')) w = w.slice(0, -1); }
    else if (w.endsWith('ь') && w.length - 1 >= rv) w = w.slice(0, -1);
  }
  return w;
}

// ---------- Слова, индекс, запрос ----------
const STOP = new Set(('и в во на не что как почему зачем ли а но по для с со из к ко у о об от до за при это так же бы ' +
  'или то его ее её их мы вы он она оно они я ты где когда какой какая какие каким чем чтобы если уже ещё еще есть ' +
  'было быть все всё вся весь очень можно нужно надо будет сделать делать нет да').split(' ').map(s => s.replace(/ё/g, 'е')));

const WORD_RE = /[\p{L}\p{N}]+/gu;
export const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е');

/** Слова запроса → основы (служебные слова и одиночные буквы отбрасываются) */
export function queryStems(q) {
  const words = norm(q).match(WORD_RE) || [];
  const meaningful = words.filter(w => w.length > 1 && !STOP.has(w));
  return [...new Set((meaningful.length ? meaningful : words.filter(w => w.length > 1)).map(stem))];
}

// Поля статьи и их вес в ранжировании
// ingr — названия ингредиентов рецепта: «кабачки» находит блюда, где они в составе
const FIELDS = [['title', 10], ['ingr', 5], ['idea', 4], ['summary', 3], ['what', 1], ['why', 1], ['factors', 1], ['practice', 1], ['mistakes', 1], ['experiment', 1], ['limitations', 1], ['quizQ', 1]];
const BODY = ['what', 'why', 'practice', 'factors', 'mistakes', 'experiment', 'limitations', 'summary'];

/** Индекс считается один раз: для каждого поля — набор основ слов */
export function buildIndex(articles) {
  return articles.map(a => {
    const fields = {};
    for (const [f] of FIELDS) {
      const text = f === 'quizQ' ? a.quiz?.q : f === 'ingr' ? (a.ingredients?.items || []).map(it => it.name).join(' ') : a[f];
      fields[f] = new Set((norm(text).match(WORD_RE) || []).map(stem));
    }
    return { article: a, fields, title: norm(a.title) };
  });
}

// Совпадение основы слова документа с основой из запроса: точно или по началу
// (так недописанное слово «клейк» уже находит «клейковина»)
const matchStem = (docStem, qStem) => docStem === qStem || (qStem.length >= 4 && docStem.startsWith(qStem));

function fieldScore(set, q) {
  if (set.has(q)) return 1;
  for (const s of set) if (matchStem(s, q)) return 0.7;
  return 0;
}

/** Поиск: каждое значимое слово запроса должно найтись в статье. Результат отсортирован по релевантности. */
export function search(index, query) {
  const qs = queryStems(query);
  if (!qs.length) return null; // пустой запрос — показываем всё
  const phrase = norm(query).trim();
  const results = [];
  for (const entry of index) {
    let total = 0, ok = true;
    for (const q of qs) {
      let best = 0;
      for (const [f, w] of FIELDS) best += fieldScore(entry.fields[f], q) * w;
      if (!best) { ok = false; break; }
      total += best;
    }
    if (!ok) continue;
    if (phrase.length > 3 && entry.title.includes(phrase)) total += 20; // точная фраза в заголовке
    results.push({ article: entry.article, score: total, stems: qs });
  }
  return results.sort((a, b) => b.score - a.score);
}

// ---------- Подсветка ----------
/** Делит текст на куски [{ text, hit }] — совпавшие слова помечены hit: true. Без HTML: безопасно для вывода. */
export function highlight(text, stems) {
  const src = String(text || '');
  const out = [];
  let last = 0;
  for (const m of src.matchAll(WORD_RE)) {
    const s = stem(norm(m[0]));
    if (!stems.some(q => matchStem(s, q))) continue;
    if (m.index > last) out.push({ text: src.slice(last, m.index), hit: false });
    out.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ text: src.slice(last), hit: false });
  return out.length ? out : [{ text: src, hit: false }];
}

/** Ингредиенты рецепта, совпавшие с запросом (для строки «В составе: …» в результатах) */
export function ingredientHits(article, stems) {
  if (!stems.length) return [];
  return (article.ingredients?.items || []).map(it => it.name).filter(n => (norm(n).match(WORD_RE) || []).some(w => stems.some(q => matchStem(stem(w), q))));
}

/** Фрагмент текста статьи вокруг первого совпадения (если его нет в заголовке и вводной фразе) */
export function snippet(article, stems, radius = 70) {
  for (const f of BODY) {
    const text = String(article[f] || '').replace(/\s+/g, ' ');
    for (const m of text.matchAll(WORD_RE)) {
      if (!stems.some(q => matchStem(stem(norm(m[0])), q))) continue;
      let from = Math.max(0, m.index - radius), to = Math.min(text.length, m.index + m[0].length + radius);
      // по границам слов
      if (from > 0) { const sp = text.indexOf(' ', from); if (sp > 0 && sp < m.index) from = sp + 1; }
      if (to < text.length) { const sp = text.lastIndexOf(' ', to); if (sp > m.index + m[0].length) to = sp; }
      return (from > 0 ? '…' : '') + text.slice(from, to) + (to < text.length ? '…' : '');
    }
  }
  return null;
}
