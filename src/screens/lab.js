import { ARTICLES } from '../data/index.js';
import { state, saveState } from '../store.js';
import { render } from '../router.js';
import { toast } from '../toast.js';
import { escapeHtml } from '../utils.js';
import { qOrder } from '../quiz.js';
import { labBar } from './tools.js';

// --- ЭКРАН 5: ПРАКТИКА (ТЕСТЫ И ЖУРНАЛ ЭКСПЕРИМЕНТОВ) ---
export function renderLab() {
  const solvedCount = Object.keys(state.quizScores).length;
  const correctCount = Object.entries(state.quizScores).filter(([aid, ans]) => {
    const art = ARTICLES.find(x => x.id === aid);
    return art && art.quiz.a === ans;
  }).length;

  return `
    ${labBar()}

    ${state.labTab === 'quiz' ? `
      <div class="card" style="background:var(--secondary-soft);">
        <strong>Ваш результат: ${correctCount} верных из ${solvedCount} пройденных (всего ${ARTICLES.length} вопросов)</strong>
        <div style="font-size:0.84rem;margin-top:4px;">Отвечайте на вопросы ниже, чтобы закрепить химию и физику процессов.</div>
      </div>
      ${ARTICLES.map((a, idx) => {
        const userAns = state.quizScores[a.id];
        return `
          <div class="card">
            <span class="tag terra">Вопрос №${idx + 1} • ${escapeHtml(a.title)}</span>
            <div style="font-weight:700;margin:6px 0 10px 0;">${escapeHtml(a.quiz.q)}</div>
            ${qOrder(a).map(oIdx => { const opt = a.quiz.opts[oIdx];
              let cls = 'quiz-opt';
              if (userAns !== undefined) {
                if (oIdx === a.quiz.a) cls += ' correct';
                else if (oIdx === userAns) cls += ' wrong';
              }
              return `<button class="${cls}" onclick="answerArticleQuiz('${a.id}', ${oIdx})">${escapeHtml(opt)}</button>`;
            }).join('')}
            ${userAns !== undefined ? `
              <div style="font-size:0.84rem;padding:8px 10px;background:var(--surface-alt);border-radius:10px;">
                <strong>Объяснение:</strong> ${escapeHtml(a.quiz.exp)}
                <div style="margin-top:8px"><button class="btn outline" style="padding:6px 12px" onclick="retryQuiz('${a.id}')">Ответить заново</button></div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    ` : renderJournal()}
  `;
}

// --- журнал: черновик не теряется, есть редактирование и подтверждение удаления ---
export function renderJournal() {
  const d = state.jDraft, ed = state.jEditId !== null;
  const fld = (k, ph, ml, rows) => rows
    ? `<textarea class="field" rows="${rows}" maxlength="${ml}" aria-label="${ph}" placeholder="${ph}" oninput="state.jDraft.${k}=this.value">${escapeHtml(d[k])}</textarea>`
    : `<input id="jDish" class="field" maxlength="${ml}" aria-label="${ph}" placeholder="${ph}" value="${escapeHtml(d[k])}" oninput="state.jDraft.${k}=this.value">`;
  return `
    <div class="card">
      <h3 style="margin:0 0 10px 0;font-size:1.05rem;">${ed ? '✏️ Редактирование записи' : '➕ Новая запись в журнал экспериментов'}</h3>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${fld('dish', 'Что готовили (например: Стейк рибай / Хлеб на закваске)', 200, 0)}
        ${fld('ing', 'Ингредиенты и точные пропорции (граммы, % соли, гидратация)', 2000, 2)}
        ${fld('temp', 'Температура и время (внутри куска, духовка, расстойка)', 2000, 2)}
        ${fld('res', 'Что получилось (текстура, корочка, сочность, ошибки)', 2000, 2)}
        ${fld('next', 'Что изменить в следующий раз (гипотеза)', 2000, 2)}
        <button class="btn full" onclick="addJournalEntry()">${ed ? 'Сохранить изменения' : 'Сохранить эксперимент на устройстве'}</button>
        ${ed ? '<button class="btn outline full" onclick="cancelJournalEdit()">Отмена</button>' : ''}
      </div>
    </div>
    ${state.journal.length ? '' : '<div class="card" style="text-align:center;color:var(--text-muted)">Записей пока нет. Добавьте первый эксперимент выше.</div>'}
    ${state.journal.map(item => `
      <div class="card note">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px;">
          <span class="tag olive">📅 ${escapeHtml(item.date)}</span>
          <span><button class="icon-btn" aria-label="Редактировать запись" onclick="editJournalEntry(${item.id})">✏️</button>
          <button class="icon-btn" aria-label="Удалить запись" onclick="deleteJournalEntry(${item.id})">🗑️</button></span>
        </div>
        <h4 style="margin:0 0 6px 0;font-size:1.02rem;overflow-wrap:anywhere;">${escapeHtml(item.dish)}</h4>
        <div style="font-size:0.86rem;margin-bottom:4px;overflow-wrap:anywhere;"><strong>⚖️ Пропорции:</strong> ${escapeHtml(item.ing)}</div>
        <div style="font-size:0.86rem;margin-bottom:4px;overflow-wrap:anywhere;"><strong>🌡️ Режим:</strong> ${escapeHtml(item.temp)}</div>
        <div style="font-size:0.86rem;margin-bottom:4px;overflow-wrap:anywhere;"><strong>🔬 Результат:</strong> ${escapeHtml(item.result)}</div>
        <div style="font-size:0.86rem;padding:8px;border-radius:8px;background:var(--primary-soft);overflow-wrap:anywhere;"><strong>🚀 На следующий раз:</strong> ${escapeHtml(item.next)}</div>
      </div>`).join('')}`;
}
export function addJournalEntry() {
  const d = state.jDraft, dish = d.dish.trim();
  if (!dish) { toast('Укажите название блюда или эксперимента'); const e = document.getElementById('jDish'); if (e) e.focus(); return; }
  const v = k => d[k].trim() || '—', fields = { dish, ing: v('ing'), temp: v('temp'), result: v('res'), next: v('next') };
  const editing = state.jEditId !== null;
  if (editing) { const it = state.journal.find(x => x.id === state.jEditId); if (it) Object.assign(it, fields); }
  else state.journal.unshift({ id: Date.now(), date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }), ...fields });
  state.jDraft = { dish: '', ing: '', temp: '', res: '', next: '' }; state.jEditId = null;
  toast(saveState() ? (editing ? 'Запись обновлена' : 'Запись сохранена') : 'Запись добавлена, но не сохранена на устройстве');
  render();
}
export function editJournalEntry(id) {
  const it = state.journal.find(x => x.id === id); if (!it) return;
  const c = x => x === '—' ? '' : x;
  state.jDraft = { dish: it.dish, ing: c(it.ing), temp: c(it.temp), res: c(it.result), next: c(it.next) }; state.jEditId = id;
  render(); window.scrollTo(0, 0);
}
export function cancelJournalEdit() { state.jDraft = { dish: '', ing: '', temp: '', res: '', next: '' }; state.jEditId = null; render(); }
export function deleteJournalEntry(id) {
  if (!confirm('Удалить эту запись журнала? Действие нельзя отменить.')) return;
  state.journal = state.journal.filter(x => x.id !== id);
  if (state.jEditId === id) { state.jEditId = null; state.jDraft = { dish: '', ing: '', temp: '', res: '', next: '' }; }
  toast(saveState() ? 'Запись удалена' : 'Удалено, но не сохранено на устройстве'); render();
}
