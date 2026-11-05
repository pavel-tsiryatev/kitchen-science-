// Статьи справочника: Markdown-файлы в content/articles/*.md → данные приложения.
//
// Формат файла (подробно — docs/CONTENT.md):
//   ---
//   id, section, title, idea, related, evidence, reviewed, quiz, sources   ← YAML
//   ---
//   ## Что происходит
//   ...текст, абзацы через пустую строку...
//   ## Почему это происходит
//   ...
//
// Любая ошибка в файле останавливает сборку с указанием файла и поля.
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse as parseYaml } from 'yaml';

/** Заголовок раздела в Markdown → поле статьи. Порядок = порядок показа в приложении. */
export const BODY_SECTIONS = [
  ['Что происходит', 'what', true],
  ['Почему это происходит', 'why', true],
  ['Что влияет на результат', 'factors', true],
  ['Как применить на практике', 'practice', true],
  ['Типичные ошибки', 'mistakes', true],
  ['Домашний эксперимент', 'experiment', true],
  ['Границы применимости', 'limitations', false],
  ['Коротко', 'summary', true],
];

/** Уровень доказательности статьи */
export const EVIDENCE = {
  high: 'Высокий: механизм подтверждён независимыми рецензируемыми работами',
  medium: 'Средний: основное подтверждено, часть деталей зависит от условий',
  low: 'Низкий: практическое правило с ограниченными данными',
  unverified: 'Источники ещё не сверены',
};

export const SECTION_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const DOI_RE = /^10\.\d{4,9}\/\S+$/;
const ISBN_RE = /^(97[89])?\d{9}[\dX]$/;

class ContentError extends Error {}
const fail = (file, msg) => { throw new ContentError(`${file}: ${msg}`); };
const str = (v, file, field, { optional = false } = {}) => {
  if (v === undefined || v === null || v === '') { if (optional) return undefined; fail(file, `не заполнено поле «${field}»`); }
  if (typeof v !== 'string' && typeof v !== 'number') fail(file, `поле «${field}» должно быть текстом`);
  return String(v).trim();
};

/** Разбор одного файла статьи. Бросает ошибку с понятным описанием. */
export function parseArticle(text, file = 'статья.md') {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) fail(file, 'файл должен начинаться с блока «---» с полями статьи');
  let meta;
  try { meta = parseYaml(m[1]) || {}; } catch (e) {
    const hint = /mapping/i.test(e.message) ? '. Подсказка: если в значении есть «: » (двоеточие с пробелом), возьмите всё значение в кавычки' : '';
    fail(file, `ошибка в блоке полей: ${e.message.split('\n')[0]}${hint}`);
  }

  const a = {
    id: str(meta.id, file, 'id'),
    sec: str(meta.section, file, 'section'),
    title: str(meta.title, file, 'title'),
    idea: str(meta.idea, file, 'idea'),
    related: meta.related ?? [],
    evidence: meta.evidence ?? 'unverified',
    reviewed: meta.reviewed ? String(meta.reviewed instanceof Date ? meta.reviewed.toISOString().slice(0, 10) : meta.reviewed) : undefined,
  };
  if (basename(file) !== `${a.id}.md` && file !== 'статья.md') fail(file, `имя файла должно совпадать с id: ${a.id}.md`);
  if (!SECTION_IDS.includes(a.sec)) fail(file, `неизвестный раздел «${a.sec}» (допустимы ${SECTION_IDS.join(', ')})`);
  if (!Array.isArray(a.related)) fail(file, '«related» должен быть списком id');
  a.related = a.related.map(String);
  if (!(a.evidence in EVIDENCE)) fail(file, `«evidence» должен быть одним из: ${Object.keys(EVIDENCE).join(', ')}`);
  if (a.evidence !== 'unverified' && !a.reviewed) fail(file, 'для проверенной статьи укажите дату сверки источников «reviewed»');

  // Вопрос
  const q = meta.quiz;
  if (!q || typeof q !== 'object') fail(file, 'нет блока «quiz»');
  a.quiz = { q: str(q.question, file, 'quiz.question'), opts: q.options, a: q.answer, exp: str(q.explanation, file, 'quiz.explanation') };
  if (!Array.isArray(a.quiz.opts) || a.quiz.opts.length < 2) fail(file, '«quiz.options» — список минимум из двух вариантов');
  a.quiz.opts = a.quiz.opts.map((o, i) => str(o, file, `quiz.options[${i}]`));
  if (!Number.isInteger(a.quiz.a) || a.quiz.a < 0 || a.quiz.a >= a.quiz.opts.length) fail(file, '«quiz.answer» — номер верного варианта, считая с 0');

  // Источники
  if (!Array.isArray(meta.sources) || !meta.sources.length) fail(file, 'нужен хотя бы один источник в «sources»');
  a.sources = meta.sources.map((s, i) => parseSource(s, file, i, a.evidence));

  // Текст статьи по разделам «## Заголовок»
  const body = {};
  const parts = m[2].split(/^##\s+/m);
  if (parts[0].trim()) fail(file, 'текст до первого заголовка «## …» не допускается');
  for (const part of parts.slice(1)) {
    const nl = part.indexOf('\n');
    const heading = (nl < 0 ? part : part.slice(0, nl)).trim();
    const content = (nl < 0 ? '' : part.slice(nl + 1)).trim();
    const sec = BODY_SECTIONS.find(([h]) => h === heading);
    if (!sec) fail(file, `неизвестный раздел «## ${heading}». Допустимы: ${BODY_SECTIONS.map(([h]) => h).join('; ')}`);
    if (body[sec[1]] !== undefined) fail(file, `раздел «## ${heading}» встречается дважды`);
    // Абзацы разделяются пустой строкой; переносы внутри абзаца — просто пробелы
    body[sec[1]] = content.replace(/\r/g, '').split(/\n[ \t]*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n\n');
  }
  for (const [heading, key, required] of BODY_SECTIONS) {
    if (body[key]) a[key] = body[key];
    else if (required) fail(file, `нет раздела «## ${heading}»`);
  }
  return a;
}

function parseSource(s, file, i, evidence) {
  const at = `sources[${i}]`;
  if (typeof s === 'string') {
    if (evidence !== 'unverified') fail(file, `${at}: у проверенной статьи источник должен быть с полями authors/year/title и doi, isbn или publisher`);
    return { text: s.trim() };
  }
  if (!s || typeof s !== 'object') fail(file, `${at}: неверный формат источника`);
  const src = {
    authors: str(s.authors, file, `${at}.authors`),
    year: Number(s.year),
    title: str(s.title, file, `${at}.title`),
    published: str(s.published, file, `${at}.published`, { optional: true }),
    doi: str(s.doi, file, `${at}.doi`, { optional: true }),
    isbn: str(s.isbn, file, `${at}.isbn`, { optional: true }),
    url: str(s.url, file, `${at}.url`, { optional: true }),
    note: str(s.note, file, `${at}.note`, { optional: true }),
  };
  if (!Number.isInteger(src.year) || src.year < 1800 || src.year > 2100) fail(file, `${at}: год «year» должен быть числом`);
  if (src.doi && !DOI_RE.test(src.doi)) fail(file, `${at}: DOI «${src.doi}» не похож на DOI (10.xxxx/…)`);
  if (src.isbn) { const n = src.isbn.replace(/[-\s]/g, ''); if (!ISBN_RE.test(n)) fail(file, `${at}: неверный ISBN «${src.isbn}»`); src.isbn = n; }
  if (src.url && !/^https:\/\//.test(src.url)) fail(file, `${at}: ссылка должна начинаться с https://`);
  if (!src.doi && !src.isbn && !src.url && !src.published) fail(file, `${at}: укажите doi, isbn, url или published (издатель)`);
  for (const k of Object.keys(src)) if (src[k] === undefined) delete src[k];
  return src;
}

/** Все статьи из папки: проверка уникальности id и ссылок между статьями. */
export function loadArticles(dir) {
  const files = readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const list = files.map(f => parseArticle(readFileSync(join(dir, f), 'utf8'), f));
  const ids = new Set();
  for (const a of list) { if (ids.has(a.id)) fail(`${a.id}.md`, 'повторяющийся id'); ids.add(a.id); }
  for (const a of list) for (const r of a.related) {
    if (!ids.has(r)) fail(`${a.id}.md`, `в «related» указана несуществующая статья «${r}»`);
    if (r === a.id) fail(`${a.id}.md`, 'статья ссылается сама на себя');
  }
  // Порядок: по разделам, затем по номеру (a1, a2, … a10)
  const key = a => [SECTION_IDS.indexOf(a.sec), a.id.replace(/\d+$/, ''), Number((a.id.match(/\d+$/) || [0])[0])];
  return list.sort((x, y) => { const [a1, b1, c1] = key(x), [a2, b2, c2] = key(y); return a1 - a2 || b1.localeCompare(b2) || c1 - c2; });
}

/** Глоссарий (content/glossary.yaml): проверка полей, уникальности и ссылок на статьи */
export function parseGlossary(text, articleIds, file = 'glossary.yaml') {
  let list;
  try { list = parseYaml(text); } catch (e) {
    const hint = /mapping/i.test(e.message) ? '. Подсказка: если в значении есть «: », возьмите его в кавычки' : '';
    fail(file, `ошибка YAML: ${e.message.split('\n')[0]}${hint}`);
  }
  if (!Array.isArray(list) || !list.length) fail(file, 'глоссарий должен быть списком терминов');
  const ids = new Set(), names = new Map();
  return list.map((t, i) => {
    const at = `термин №${i + 1}${t && t.term ? ` «${t.term}»` : ''}`;
    if (!t || typeof t !== 'object') fail(file, `${at}: неверный формат`);
    const e = {
      id: str(t.id, file, `${at}.id`),
      term: str(t.term, file, `${at}.term`),
      aliases: (t.aliases ?? []).map(a => String(a).trim()).filter(Boolean),
      definition: str(t.definition, file, `${at}.definition`),
      articles: (t.articles ?? []).map(String),
    };
    if (!/^[a-z0-9-]+$/.test(e.id)) fail(file, `${at}: id только латиницей, цифрами и дефисом`);
    if (ids.has(e.id)) fail(file, `${at}: повторяющийся id «${e.id}»`);
    ids.add(e.id);
    for (const n of [e.term, ...e.aliases]) {
      const k = n.toLowerCase().replace(/ё/g, 'е');
      if (names.has(k)) fail(file, `${at}: «${n}» уже есть у термина «${names.get(k)}»`);
      names.set(k, e.term);
    }
    for (const a of e.articles) if (!articleIds.has(a)) fail(file, `${at}: несуществующая статья «${a}»`);
    return e;
  }).sort((a, b) => a.term.localeCompare(b.term, 'ru'));
}

export function loadGlossary(file, articleIds) {
  return parseGlossary(readFileSync(file, 'utf8'), articleIds, basename(file));
}

/** Vite-плагин: `import ARTICLES from 'virtual:articles'`, `import GLOSSARY from 'virtual:glossary'` */
export function articlesPlugin(dir, glossaryFile) {
  const MODS = { 'virtual:articles': '\0virtual:articles', 'virtual:glossary': '\0virtual:glossary' };
  const RESOLVED = new Set(Object.values(MODS));
  return {
    name: 'kuhnya-articles',
    resolveId: id => MODS[id] ?? null,
    load(id) {
      if (!RESOLVED.has(id)) return null;
      for (const f of readdirSync(dir)) this.addWatchFile(join(dir, f));
      const articles = loadArticles(dir);
      if (id === MODS['virtual:articles']) return `export default ${JSON.stringify(articles)};`;
      this.addWatchFile(glossaryFile);
      return `export default ${JSON.stringify(loadGlossary(glossaryFile, new Set(articles.map(a => a.id))))};`;
    },
    handleHotUpdate({ file, server }) {
      if (!(file.startsWith(dir) && file.endsWith('.md')) && file !== glossaryFile) return;
      for (const r of RESOLVED) { const mod = server.moduleGraph.getModuleById(r); if (mod) server.moduleGraph.invalidateModule(mod); }
      server.ws.send({ type: 'full-reload' });
    },
  };
}
