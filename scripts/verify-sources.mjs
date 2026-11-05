// Сверка источников статей с научными базами:
//   DOI  → Crossref (api.crossref.org): совпадают ли название и год
//   ISBN → OpenLibrary (openlibrary.org): существует ли книга
//
//   npm run verify:sources            все статьи с DOI/ISBN
//   npm run verify:sources -- c1 b1   только указанные
//
// Нужен доступ в интернет. Код выхода: 0 — всё подтверждено, 1 — есть расхождения,
// 2 — часть источников проверить не удалось (нет связи с базой).
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadArticles } from './content.mjs';

// Встроенный fetch в Node не читает HTTPS_PROXY сам: за прокси перезапускаемся с NODE_USE_ENV_PROXY=1
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}

const DIR = fileURLToPath(new URL('../content/articles', import.meta.url));
const only = process.argv.slice(2);
const UA = 'kuhnya-nauka-vkusa/1.0 (source verification; https://github.com/pavel-tsiryatev/kitchen-science-)';

async function getJson(url, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (i >= tries) throw e;
      await new Promise(res => setTimeout(res, 1500 * i));
    }
  }
}

// Похожесть названий: доля значимых слов из статьи, найденных в названии из базы
const words = s => String(s).toLowerCase().replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').match(/[\p{L}\p{N}]{3,}/gu) || [];
function similarity(ours, theirs) {
  const t = new Set(words(theirs)), o = words(ours);
  return o.length ? o.filter(w => t.has(w)).length / o.length : 0;
}

async function checkDoi(s) {
  const m = (await getJson(`https://api.crossref.org/works/${encodeURIComponent(s.doi)}`))?.message;
  if (!m) return { ok: false, msg: 'DOI не найден в Crossref' };
  const title = [...(m.title || []), ...(m.subtitle || [])].join(': ');
  const year = m.issued?.['date-parts']?.[0]?.[0];
  const sim = similarity(s.title, title);
  const problems = [];
  if (sim < 0.6) problems.push(`название не совпадает (в Crossref: «${title}»)`);
  if (year && Math.abs(year - s.year) > 1) problems.push(`год ${s.year}, в Crossref ${year}`);
  // Фамилия первого автора: часть до первой запятой без инициалов («van Boekel M. A. J. S.» → vanboekel)
  const norm = x => String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
  const ourFirst = norm(s.authors.split(',')[0].split(/\s+/).filter(w => !/^(\p{Lu}\.-?)+$/u.test(w)).join(''));
  const theirs = (m.author || []).map(x => norm(x.family || x.name));
  // Некоторые издатели пишут инициалы в поле фамилии («P. D. Sanz») или всех авторов одной строкой
  if (ourFirst && theirs.length && !theirs[0].endsWith(ourFirst) && !(theirs.length === 1 && theirs[0].includes(ourFirst))) problems.push(`первый автор «${s.authors.split(',')[0]}», в Crossref: ${(m.author || []).slice(0, 3).map(x => x.family).join(', ')}`);
  // Том и первая страница из поля published («Food Chemistry, 212, 789–797»): ловят соседние статьи
  // с почти одинаковыми названиями (например, «Part I» и «Part II»)
  const pages = /(\d+)\s*[–-]\s*\d+\s*$/.exec(s.published || '');
  const crPage = String(m.page || '').split('-')[0];
  if (pages && crPage && Number(pages[1]) !== Number(crPage)) problems.push(`страницы ${pages[0]}, в Crossref ${m.page}`);
  const vol = /,\s*(\d+)\s*(?:\(|,)/.exec(s.published || '');
  if (vol && m.volume && vol[1] !== String(m.volume)) problems.push(`том ${vol[1]}, в Crossref ${m.volume}`);
  return { ok: !problems.length, msg: problems.join('; ') || `${(m['container-title'] || [''])[0]} ${year}` };
}

async function checkIsbn(s) {
  const d = await getJson(`https://openlibrary.org/isbn/${s.isbn}.json`);
  if (!d) return { ok: false, msg: 'ISBN не найден в OpenLibrary', soft: true };
  const sim = similarity(s.title.replace(/\(.*?\)/g, ''), `${d.title || ''} ${d.subtitle || ''}`);
  return sim >= 0.5 ? { ok: true, msg: `${d.title} (${d.publish_date || '?'})` } : { ok: false, msg: `название не совпадает (в OpenLibrary: «${d.title}»)` };
}

const articles = loadArticles(DIR).filter(a => !only.length || only.includes(a.id));
let checked = 0, failed = 0, unverifiable = 0, skipped = 0;
for (const a of articles) {
  const withIds = a.sources.filter(s => s.doi || s.isbn);
  skipped += a.sources.length - withIds.length;
  if (!withIds.length) continue;
  console.log(`\n${a.id} — ${a.title}`);
  for (const s of withIds) {
    checked++;
    let res;
    try { res = s.doi ? await checkDoi(s) : await checkIsbn(s); } catch (e) { res = { ok: false, msg: `нет ответа: ${e.message}`, soft: true }; }
    const mark = res.ok ? '✓' : res.soft ? '?' : '✗';
    if (!res.ok) res.soft ? unverifiable++ : failed++;
    console.log(`  ${mark} ${s.authors} (${s.year}) ${s.doi ? 'DOI ' + s.doi : 'ISBN ' + s.isbn}\n      ${res.msg}`);
    await new Promise(r => setTimeout(r, 300)); // вежливость к API
  }
}
console.log(`\nПроверено: ${checked}, не подтверждено: ${failed}, не удалось проверить: ${unverifiable}, источников без DOI/ISBN: ${skipped}`);
if (failed) console.log('Есть неподтверждённые источники: исправьте DOI/ISBN или описание источника.');
else if (unverifiable) console.log('Часть источников проверить не удалось: проверьте доступ к api.crossref.org и openlibrary.org и запустите снова.');
process.exit(failed ? 1 : unverifiable ? 2 : 0);
