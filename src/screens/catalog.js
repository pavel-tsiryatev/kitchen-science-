import { ARTICLES, SECTIONS } from '../data/index.js';
import { state } from '../store.js';
import { escapeHtml, normQ, ic, readMin, tileOf } from '../utils.js';

// --- ЭКРАН 2: КАТАЛОГ И ПОИСК ---
export function renderCatalog() {
  const q = normQ(state.searchQuery);
  const filtered = ARTICLES.filter(a => {
    if (!secMatch(a)) return false;
    if (state.secFilter === 'UNREAD' && state.readIds.includes(a.id)) return false;
    if (!q) return true;
    const hay = searchHay(a);
    return hay.includes(q);
  });

  return `
    <h1 class="screen-title">Библиотека</h1><p class="sub">Знания, которые делают вкуснее</p>
    <input type="search" id="catSearchInput" class="search-box"
      placeholder="🔍 Поиск по 36 статьям, терминам и процессам..."
      value="${escapeHtml(state.searchQuery)}"
      oninput="state.searchQuery=this.value;renderCatalogListOnly()">

    <div class="pill-bar">
      <button class="pill ${state.secFilter==='ALL'?'active':''}" onclick="state.secFilter='ALL';render()">Все (${ARTICLES.length})</button>
      <button class="pill ${state.secFilter==='UNREAD'?'active':''}" onclick="state.secFilter='UNREAD';render()">Непрочитанные</button>
      ${SECTIONS.map(s => `
        <button class="pill ${state.secFilter===s.id?'active':''}" onclick="state.secFilter='${s.id}';render()">
          ${s.letter}. ${escapeHtml(s.title)}
        </button>
      `).join('')}
    </div>

    <div id="catalogListContainer">
      ${renderCatalogCards(filtered)}
    </div>
  `;
}

export function renderCatalogListOnly() {
  const q = normQ(state.searchQuery);
  const filtered = ARTICLES.filter(a => {
    if (!secMatch(a)) return false;
    if (state.secFilter === 'UNREAD' && state.readIds.includes(a.id)) return false;
    if (!q) return true;
    const hay = searchHay(a);
    return hay.includes(q);
  });
  const box = document.getElementById('catalogListContainer');
  if (box) box.innerHTML = renderCatalogCards(filtered);
}

export function searchHay(a) {
  return normQ([a.title, a.idea, a.what, a.why, a.factors, a.practice, a.mistakes, a.experiment, a.summary, a.quiz.q].join(' '));
}

export function secMatch(a) { const f = state.secFilter; return f === 'ALL' || f === 'UNREAD' || (f === 'TECH' ? 'ABCDF'.includes(a.sec) : a.sec === f); }

export function renderCatalogCards(list) {
  if (!list.length) return `<div class="card" style="text-align:center;padding:28px;"><strong>Ничего не найдено</strong>
    <p style="color:var(--text-muted);font-size:0.88rem;">Измените запрос или сбросьте фильтры.</p>
    <button class="btn outline" onclick="state.searchQuery='';state.secFilter='ALL';render()">Сбросить фильтры</button></div>`;
  return list.map(a => {
    const sec = SECTIONS.find(s => s.id === a.sec), isRead = state.readIds.includes(a.id), isFav = state.favIds.includes(a.id);
    const g = a.sec === 'E' ? 'atom' : a.sec === 'G' ? 'therm' : a.sec === 'H' ? 'flask' : 'hat';
    return `<div class="card card-ed card-clickable" onclick="navigate('article', '${a.id}')">
      <div class="tile ${tileOf(a.sec)}">${ic(g, 22)}</div>
      <div style="min-width:0"><div class="ed-t">${escapeHtml(a.title)}</div><div class="ed-d">${escapeHtml(a.idea)}</div>
      <div class="ed-m">${readMin(a)} мин · ${escapeHtml(sec.title)}${isRead ? ' · ✓ изучено' : ''}${isFav ? ' · ★' : ''}</div></div></div>`;
  }).join('');
}
