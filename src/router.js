import { tick } from 'svelte';
import { state, saveState } from './store.svelte.js';

// --- навигация с историей (кнопка «Назад») ---
// Экран выбирается реактивно по state.tab в App.svelte; здесь только переходы и история.
export function navigate(tab, param = null, fromPop = false) {
  state.tab = tab;
  if (tab === 'catalog' && param) state.secFilter = param;
  if (tab === 'glossary') state.glossTerm = param;
  if (tab === 'article' && param) { state.currentArticleId = param; state.recentIds = [param, ...(state.recentIds || []).filter(x => x !== param)].slice(0, 6); saveState(); }
  if (!fromPop) { try { history.pushState({ tab, sec: state.secFilter, art: state.currentArticleId, sub: state.subTab, lab: state.labTab }, ''); } catch (e) {} }
  window.scrollTo(0, 0);
}

export function initHistory() {
  try { history.replaceState({ tab: 'home', sec: 'ALL', art: null, sub: 'calc', lab: state.labTab }, ''); } catch (e) {}
  window.addEventListener('popstate', e => {
    const s = e.state || { tab: 'home' };
    state.secFilter = s.sec || 'ALL'; state.currentArticleId = s.art || null; state.subTab = s.sub || 'calc';
    if (s.lab) state.labTab = s.lab;
    navigate(s.tab || 'home', null, true);
  });
}

export function goSearch() {
  navigate('catalog');
  tick().then(() => { const i = document.getElementById('catSearchInput'); if (i) i.focus(); });
}

export function labGo(k) {
  if (k === 'journal' || k === 'quiz') { state.labTab = k; navigate('lab'); }
  else { state.subTab = k; navigate('tools'); }
}
