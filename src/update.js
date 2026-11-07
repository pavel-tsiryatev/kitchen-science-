// Проверка новой версии приложения (только Android: веб-версия всегда свежая).
// Тестовые сборки (1.0.0-dev.57) сравниваются с релизом «dev» на GitHub,
// релизные (1.2.0) — с последним релизом v*. Проверка не чаще раза в 12 часов.

/* global __APP_VERSION__ */
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const API = 'https://api.github.com/repos/pavel-tsiryatev/kitchen-science-/releases';
export const RELEASES_PAGE = 'https://github.com/pavel-tsiryatev/kitchen-science-/releases';
const CHECK_KEY = 'kuhnya_update_check', SKIP_KEY = 'kuhnya_update_skip';
const INTERVAL = 12 * 3600 * 1000;

/** Номер тестовой сборки из «1.0.0-dev.57» (или null для релизной версии) */
export function devNumber(v) { const m = /-dev\.(\d+)\b/.exec(String(v || '')); return m ? Number(m[1]) : null; }

/** Сравнение версий 1.2.10 > 1.2.9 */
export function newerSemver(a, b) {
  const p = v => String(v).replace(/^v/, '').split(/[.-]/).slice(0, 3).map(n => parseInt(n, 10) || 0);
  const [x, y] = [p(a), p(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
}

/** Из ответа GitHub — версия и ссылка на APK, если она новее текущей; иначе null */
export function pickUpdate(current, release) {
  if (!release || release.draft) return null;
  const apk = (release.assets || []).find(x => /\.apk$/i.test(x.name));
  if (!apk) return null;
  const cur = devNumber(current);
  if (cur !== null) {
    const n = devNumber(`${release.name || ''} ${release.body || ''}`);
    if (n === null || n <= cur) return null;
    return { version: (/\d+\.\d+\.\d+-dev\.\d+/.exec(`${release.name} ${release.body}`) || [`dev.${n}`])[0], url: apk.browser_download_url };
  }
  const tag = release.tag_name || '';
  if (!/^v\d/.test(tag) || !newerSemver(tag, current)) return null;
  return { version: tag.replace(/^v/, ''), url: apk.browser_download_url };
}

const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

/**
 * Проверяет обновление. force — без учёта интервала и «Пропустить».
 * Возвращает { version, url } или null. Сетевые ошибки не выбрасывает.
 */
export async function checkUpdate({ force = false, fetchFn = globalThis.fetch, now = Date.now() } = {}) {
  if (!force && now - Number(get(CHECK_KEY) || 0) < INTERVAL) return null;
  set(CHECK_KEY, String(now));
  try {
    const url = devNumber(APP_VERSION) !== null ? `${API}/tags/dev` : `${API}/latest`;
    const r = await fetchFn(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) return null;
    const up = pickUpdate(APP_VERSION, await r.json());
    if (up && !force && get(SKIP_KEY) === up.version) return null;
    return up;
  } catch (e) { return null; }
}

/** «Не сейчас»: эту версию больше не предлагать */
export function skipVersion(v) { set(SKIP_KEY, v); }
