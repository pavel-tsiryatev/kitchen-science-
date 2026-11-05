import { ARTICLES } from '../data/index.js';
import { state } from '../store.js';
import { escapeHtml, ic, readMin } from '../utils.js';
import { renderCatalogCards } from './catalog.js';

export function renderHome() {
  const total = ARTICLES.length, readCount = state.readIds.length, pct = Math.round(readCount / total * 100);
  const nextArt = ARTICLES.find(a => !state.readIds.includes(a.id)) || ARTICLES[0], cover = ARTICLES.find(a => a.id === 'a1') || ARTICLES[0];
  const rec = (state.recentIds || []).map(id => ARTICLES.find(a => a.id === id)).filter(Boolean).slice(0, 3);
  const dir = (k, t, d, i, c) => `<button class="dir ${c}" onclick="navigate('catalog','${k}')">${ic(i)}<b>${t}</b><span>${d}</span></button>`;
  const row = (i, t, d, call) => `<button class="row" onclick="${call}">${ic(i, 22)}<span><b>${t}</b><small>${d}</small></span><span class="go">${ic('chev', 18)}</span></button>`;
  const crumb = [[70,150,34,22],[150,120,26,18],[235,160,38,24],[310,125,22,15],[120,195,20,13],[200,205,30,17],[290,200,24,16],[355,170,18,12],[60,100,16,11],[180,85,22,14]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#1E1710" opacity=".55"/><ellipse cx="${x}" cy="${y}" rx="${rx + 4}" ry="${ry + 4}" fill="none" stroke="#C9965F" stroke-width="2" opacity=".5"/>`).join('');
  return `
    <section class="cover" aria-label="Обложка исследования">
      <svg class="crumb" viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="340" fill="#6B4A2B"/><rect y="250" width="400" height="90" fill="#4A321C"/>${crumb}</svg>
      <div class="cover-body"><span class="mark">ИССЛЕДОВАНИЕ № 01</span>
        <h2>Почему хлеб становится воздушным?</h2>
        <p>Дрожжи, газовые пузырьки и структура клейковины — от химии теста до хрустящей корочки.</p>
        <div class="cover-foot"><span>${ic('clock', 16)} ${readMin(cover)} мин</span><button class="btn" onclick="navigate('article','${cover.id}')">Читать ${ic('chev', 16)}</button></div></div>
    </section>
    <button class="searchbar" onclick="goSearch()">${ic('search', 20)}<span>Поиск по материалам</span></button>
    <div class="eyebrow"><h3>Направления</h3><button class="link" onclick="navigate('catalog','ALL')">Все темы</button></div>
    <div class="dirs">
      ${dir('E', 'Химия вкуса', 'Рецепторы, аромат, баланс', 'atom', 't-chem')}${dir('G', 'Физика приготовления', 'Тепло, влага, посуда', 'therm', 't-phys')}
      ${dir('TECH', 'Кулинарные техники', 'Тесто, десерты, мясо, соусы', 'hat', 't-tech')}${dir('H', 'Эксперименты', 'Проверь теорию сам', 'flask', 't-exp')}
    </div>
    <div class="eyebrow"><h3>Твоя лаборатория</h3></div>
    <div class="list">
      ${row('flask', 'Калькуляторы', 'Порции и проценты пекаря', "state.subTab='calc';navigate('tools')")}
      ${row('warn', 'Диагностика ошибок', 'Что пошло не так?', "state.subTab='trouble';navigate('tools')")}
      ${row('book', 'Журнал экспериментов', 'Результаты и наблюдения', "state.labTab='journal';navigate('lab')")}
    </div>
    <div class="eyebrow"><h3>Продолжить обучение</h3><span class="mono-s">${readCount} из ${total}</span></div>
    <div class="card"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="ed-t" style="margin-top:8px">${escapeHtml(nextArt.title)}</div>
      <button class="btn outline" style="margin-top:10px" onclick="navigate('article','${nextArt.id}')">Открыть статью</button></div>
    ${rec.length ? `<div class="eyebrow"><h3>Недавно открытые</h3></div>${renderCatalogCards(rec)}` : ''}`;
}
