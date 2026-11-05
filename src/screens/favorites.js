import { ARTICLES } from '../data/index.js';
import { state } from '../store.js';
import { renderCatalogCards } from './catalog.js';

// --- ЭКРАН 6: ИЗБРАННОЕ И НАСТРОЙКИ ---
export function renderFavorites() {
  const favArts = ARTICLES.filter(a => state.favIds.includes(a.id));
  return `
    <h1 class="screen-title">Сохранённое</h1><p class="sub">Избранные статьи: ${favArts.length}</p>
    ${favArts.length ? renderCatalogCards(favArts) : `
      <div class="card" style="text-align:center;padding:24px;">
        <div style="font-size:1.8rem;">☆</div>
        <p>В избранном пока нет статей. Откройте любую статью и нажмите «В избранное».</p>
        <button class="btn" onclick="navigate('catalog','ALL')">Перейти к статьям</button>
      </div>
    `}
  `;
}
