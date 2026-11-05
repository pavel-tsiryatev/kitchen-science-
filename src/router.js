import { state, saveState } from './store.js';
import { stripEmoji } from './utils.js';
import { enhanceA11y } from './a11y.js';
import { renderHome } from './screens/home.js';
import { renderCatalog } from './screens/catalog.js';
import { renderArticle } from './screens/article.js';
import { renderTools } from './screens/tools.js';
import { renderLab } from './screens/lab.js';
import { renderFavorites } from './screens/favorites.js';
import { renderSettings } from './screens/settings.js';

export function render() {
  const el = document.getElementById('app-Main');
  if (state.tab === 'home') el.innerHTML = renderHome();
  else if (state.tab === 'catalog') el.innerHTML = renderCatalog();
  else if (state.tab === 'article') el.innerHTML = renderArticle();
  else if (state.tab === 'tools') el.innerHTML = renderTools();
  else if (state.tab === 'lab') el.innerHTML = renderLab();
  else if (state.tab === 'favorites') el.innerHTML = renderFavorites();
  else if (state.tab === 'settings') el.innerHTML = renderSettings();
  el.innerHTML = stripEmoji(el.innerHTML);
  enhanceA11y(el);
}

// --- навигация с историей (кнопка «Назад») ---
export function navigate(tab, param = null, fromPop = false) {
  state.tab = tab;
  if (tab === 'catalog' && param) state.secFilter = param;
  if (tab === 'article' && param) { state.currentArticleId = param; state.recentIds = [param, ...(state.recentIds || []).filter(x => x !== param)].slice(0, 6); saveState(); }
  document.querySelectorAll('.nav-item').forEach(btn => {
    const t = btn.getAttribute('data-tab');
    const on = t === ({ article: 'catalog', lab: 'tools' }[tab] || tab);
    btn.classList.toggle('active', on); btn.setAttribute('aria-current', on ? 'page' : 'false');
  });
  if (!fromPop) { try { history.pushState({ tab, sec: state.secFilter, art: state.currentArticleId, sub: state.subTab }, ''); } catch (e) {} }
  window.scrollTo(0, 0);
  render();
}
window.addEventListener('popstate', e => {
  const s = e.state || { tab: 'home' };
  state.secFilter = s.sec || 'ALL'; state.currentArticleId = s.art || null; state.subTab = s.sub || 'calc';
  navigate(s.tab || 'home', null, true);
});
