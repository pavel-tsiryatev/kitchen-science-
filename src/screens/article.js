import { ARTICLES, SECTIONS } from '../data/index.js';
import { state, saveState } from '../store.js';
import { render } from '../router.js';
import { escapeHtml, ic, readMin } from '../utils.js';
import { qOrder } from '../quiz.js';

// --- ЭКРАН 3: СТРАНИЦА СТАТЬИ ---
export function renderArticle() {
  const a = ARTICLES.find(x => x.id === state.currentArticleId) || ARTICLES[0];
  const sec = SECTIONS.find(s => s.id === a.sec);
  const isRead = state.readIds.includes(a.id);
  const isFav = state.favIds.includes(a.id);
  const relArts = (a.related || []).map(rid => ARTICLES.find(x => x.id === rid)).filter(Boolean);
  const qAns = state.quizScores[a.id];

  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <button class="btn outline" style="padding:8px 12px;" onclick="navigate('catalog', '${a.sec}')">${ic('back',20)}<span>${escapeHtml(sec.title.split(' ')[0])}</span></button>
      <div style="display:flex;gap:6px;">
        <button class="btn ${isFav?'':'outline'}" style="padding:8px 12px;" onclick="toggleFav('${a.id}')">
          ${ic('star',20)}<span class="sr">${isFav ? 'Убрать из избранного' : 'В избранное'}</span>
        </button>
        <button class="btn ${isRead?'secondary':'outline'}" style="padding:8px 12px;" onclick="toggleRead('${a.id}')">
          ${ic('check',20)}<span class="sr">${isRead ? 'Прочитано, снять отметку' : 'Отметить прочитанным'}</span>
        </button>
      </div>
    </div>

    ${renderArticleHead(a, sec)}

    <div class="art-block">
      <h4>1. Что происходит</h4>
      <div>${escapeHtml(a.what)}</div>
    </div>

    <div class="art-block">
      <h4>2. Почему это происходит (Научный механизм)</h4>
      <div>${escapeHtml(a.why)}</div>
    </div>

    <div class="art-block olive">
      <h4>3. Что влияет на результат</h4>
      <div>${escapeHtml(a.factors)}</div>
    </div>

    <div class="art-block olive">
      <h4>4. Как применить на практике</h4>
      <div>${escapeHtml(a.practice)}</div>
    </div>

    <div class="art-block warn">
      <h4>5. Типичные ошибки и как их избежать</h4>
      <div>${escapeHtml(a.mistakes)}</div>
    </div>

    <div class="art-block">
      <h4>6. Небольшой домашний эксперимент</h4>
      <div>🧪 ${escapeHtml(a.experiment)}</div>
    </div>

    <div class="art-block Summary">
      <h4>7. Краткий вывод (Запомнить)</h4>
      <div style="font-weight:700;">📌 ${escapeHtml(a.summary)}</div>
      <div style="margin-top:8px;font-size:0.76rem;color:var(--text-muted);">
        📚 Источники: ${escapeHtml(a.sources)}
      </div>
    </div>

    <div class="card">
      <h4 style="margin:0 0 8px 0;color:var(--primary);">🧠 Проверьте понимание статьи</h4>
      <div style="font-weight:700;margin-bottom:10px;">${escapeHtml(a.quiz.q)}</div>
      ${qOrder(a).map(idx => { const opt = a.quiz.opts[idx];
        let cls = 'quiz-opt';
        if (qAns !== undefined) {
          if (idx === a.quiz.a) cls += ' correct';
          else if (idx === qAns) cls += ' wrong';
        }
        return `<button class="${cls}" onclick="answerArticleQuiz('${a.id}', ${idx})">${escapeHtml(opt)}</button>`;
      }).join('')}
      ${qAns !== undefined ? `
        <div style="margin-top:8px;padding:10px;border-radius:10px;background:var(--surface-alt);font-size:0.86rem;">
          <strong>Разбор:</strong> ${escapeHtml(a.quiz.exp)}
          <div style="margin-top:8px"><button class="btn outline" style="padding:6px 12px" onclick="retryQuiz('${a.id}')">Ответить заново</button></div>
        </div>
      ` : ''}
    </div>

    <div class="card">
      <h4 style="margin:0 0 8px 0;">🔗 Связанные темы</h4>
      ${relArts.map(ra => `
        <div style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;color:var(--primary);font-weight:600;"
             onclick="navigate('article', '${ra.id}')">
          → ${escapeHtml(ra.title)}
        </div>
      `).join('')}
    </div>
  `;
}

export function toggleFav(id) {
  const idx = state.favIds.indexOf(id);
  if (idx >= 0) state.favIds.splice(idx, 1);
  else state.favIds.push(id);
  saveState();
  render();
}

export function toggleRead(id) {
  const idx = state.readIds.indexOf(id);
  if (idx >= 0) state.readIds.splice(idx, 1);
  else state.readIds.push(id);
  saveState();
  render();
}

export function renderArticleHead(a, sec) {
  return `<header class="art-head"><div class="kicker">${escapeHtml(sec.title)} · ${readMin(a)} мин</div>
    <h2>${escapeHtml(a.title)}</h2><div class="lead"><span class="lbl">Краткий ответ</span>${escapeHtml(a.idea)}</div></header>`;
}
