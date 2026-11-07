import { tick } from 'svelte';
import { state, saveState } from './store.svelte.js';

// --- навигация с историей (кнопка «Назад») ---
// Экран выбирается реактивно по state.tab в App.svelte; здесь только переходы и история.
export function navigate(tab, param = null, fromPop = false) {
  state.tab = tab;
  if (!fromPop) {
    // Запоминаем фильтры текущего экрана, чтобы «Назад» вернул их, а не те, что были при входе
    try { history.replaceState({ ...(history.state || {}), sec: state.secFilter, grp: state.dishGroup }, ''); } catch (e) {}
  }
  if (tab === 'catalog' && param) { state.secFilter = param; state.dishGroup = 'ALL'; }
  if (tab === 'glossary') state.glossTerm = param;
  if (tab === 'cook' && param) state.currentArticleId = param;
  if (tab === 'collection' && param) state.collectionId = param;
  if (tab === 'article' && param) { state.currentArticleId = param; state.recentIds = [param, ...(state.recentIds || []).filter(x => x !== param)].slice(0, 6); saveState(); }
  if (!fromPop) { try { history.pushState({ tab, sec: state.secFilter, grp: state.dishGroup, col: state.collectionId, art: state.currentArticleId, sub: state.subTab, lab: state.labTab, depth: depth + 1 }, ''); depth++; } catch (e) {} }
  window.scrollTo(0, 0);
}

// Сколько шагов назад есть в истории приложения (0 — стартовый экран)
let depth = 0;

export function initHistory() {
  try { history.replaceState({ tab: 'home', sec: 'ALL', art: null, sub: 'calc', lab: state.labTab, depth: 0 }, ''); } catch (e) {}
  window.addEventListener('popstate', e => {
    const s = e.state || { tab: 'home' };
    depth = s.depth || 0;
    state.secFilter = s.sec || 'ALL'; state.dishGroup = s.grp || 'ALL'; state.collectionId = s.col || null; state.currentArticleId = s.art || null; state.subTab = s.sub || 'calc';
    if (s.lab) state.labTab = s.lab;
    navigate(s.tab || 'home', null, true);
  });
}

// --- системная кнопка/жест «Назад» на Android ---
// Открытые окна (карточка термина) регистрируют здесь функцию закрытия: «Назад» сначала закрывает их.
const closers = [];
export function onBackClose(fn) {
  closers.push(fn);
  return () => { const i = closers.lastIndexOf(fn); if (i >= 0) closers.splice(i, 1); };
}

/** Обрабатывает «Назад». Возвращает false, если идти некуда и приложение можно закрыть. */
export function handleBack() {
  if (closers.length) { closers[closers.length - 1](); return true; }
  if (depth > 0) { history.back(); return true; }
  if (state.tab !== 'home') { navigate('home', null, true); try { history.replaceState({ tab: 'home', sec: state.secFilter, art: null, sub: state.subTab, lab: state.labTab, depth: 0 }, ''); } catch (e) {} return true; }
  return false;
}

export function goSearch() {
  navigate('catalog');
  tick().then(() => { const i = document.getElementById('catSearchInput'); if (i) i.focus(); });
}

export function labGo(k) {
  if (k === 'journal' || k === 'quiz') { state.labTab = k; navigate('lab'); }
  else { state.subTab = k; navigate('tools'); }
}
