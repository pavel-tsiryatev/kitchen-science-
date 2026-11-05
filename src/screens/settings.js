import { ARTICLES } from '../data/index.js';
import { state, SCHEMA, saveState, snapshot, sanitizeSaved, applyThemeAndFont } from '../store.js';
import { render } from '../router.js';
import { toast } from '../toast.js';
import { escapeHtml } from '../utils.js';


export function renderSettings() {
  const favArts = ARTICLES.filter(a => state.favIds.includes(a.id));
  return `
    <div class="card">
      <h3 style="margin:0 0 10px 0;">★ Избранные статьи (${favArts.length})</h3>
      ${favArts.length ? favArts.map(a => `
        <div style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:600;cursor:pointer;" onclick="navigate('article','${a.id}')">${escapeHtml(a.title)}</span>
          <button class="icon-btn" onclick="toggleFav('${a.id}')">✕</button>
        </div>
      `).join('') : '<div style="font-size:0.88rem;color:var(--text-muted)">Вы пока не добавили статьи в избранное.</div>'}
    </div>

    <div class="card">
      <h3 style="margin:0 0 10px 0;">🎨 Оформление и читаемость</h3>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span>Цветовая тема</span>
        <div class="seg"><button class="${state.theme==='light'?'on':''}" onclick="setTheme('light')">Светлая</button><button class="${state.theme==='dark'?'on':''}" onclick="setTheme('dark')">Тёмная</button></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span>Размер шрифта</span>
        <div style="display:flex;gap:6px;">
          <button class="btn ${state.fontScale===0.95?'':'outline'}" onclick="state.fontScale=0.95;applyThemeAndFont();saveState();render()">А-</button>
          <button class="btn ${state.fontScale===1?'':'outline'}" onclick="state.fontScale=1;applyThemeAndFont();saveState();render()">100%</button>
          <button class="btn ${state.fontScale===1.12?'':'outline'}" onclick="state.fontScale=1.12;applyThemeAndFont();saveState();render()">А+</button>
          <button class="btn ${state.fontScale===1.25?'':'outline'}" onclick="state.fontScale=1.25;applyThemeAndFont();saveState();render()">А++</button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin:0 0 10px 0;">💾 Локальные данные (100% Офлайн)</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0;">
        Все ваши заметки в журнале, прочитанные статьи и избранное хранятся исключительно в памяти вашего смартфона.
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn outline" onclick="exportBackup()">Копировать JSON</button>
        <button class="btn outline" onclick="downloadBackup()">Скачать файл</button>
        <button class="btn outline" onclick="importBackup()">Импорт из поля</button>
        <button class="btn outline" onclick="resetProgress()">Сбросить прогресс чтения</button>
      </div>
      <textarea id="backupArea" class="field" rows="3" style="margin-top:10px;" maxlength="1000000" aria-label="Резервная копия JSON" placeholder="Здесь появится резервная копия. Для импорта вставьте сюда JSON и нажмите «Импорт из поля»"></textarea>
    </div>
  `;
}

export function resetProgress() {
  if (confirm('Сбросить отметки о прочитанных статьях и тестах? Записи журнала и избранное сохранятся.')) {
    state.readIds = [];
    state.quizScores = {};
    saveState();
    render();
  }
}

// --- резервная копия: экспорт / импорт с проверкой ---
export function backupText() { return JSON.stringify({ app: 'kuhnya-nauka-vkusa', exportedAt: new Date().toISOString(), data: snapshot() }, null, 2); }
export function exportBackup() {
  const a = document.getElementById('backupArea'); a.value = backupText(); a.focus(); a.select();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(a.value).then(() => toast('Копия скопирована в буфер обмена'), () => toast('Текст выделен в поле: скопируйте вручную'));
    else toast(document.execCommand('copy') ? 'Копия скопирована' : 'Скопируйте текст из поля вручную');
  } catch (e) { toast('Скопируйте текст из поля вручную'); }
}
export function downloadBackup() {
  try {
    const u = URL.createObjectURL(new Blob([backupText()], { type: 'application/json' })), l = document.createElement('a');
    l.href = u; l.download = 'kuhnya-backup.json'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000);
    toast('Файл сформирован (проверьте папку «Загрузки»)');
  } catch (e) { toast('Скачивание недоступно: используйте «Копировать JSON»'); }
}
export function importBackup() {
  const txt = document.getElementById('backupArea').value.trim();
  if (!txt) return toast('Вставьте JSON резервной копии в поле');
  let obj; try { obj = JSON.parse(txt); } catch (e) { return toast('Это не JSON: текст повреждён или вставлен не полностью'); }
  const data = obj && obj.data && typeof obj.data === 'object' ? obj.data : obj;
  if (data && data.schema > SCHEMA) return toast('Копия создана более новой версией приложения');
  const clean = sanitizeSaved(data);
  if (!clean || !Object.keys(clean).length) return toast('В тексте не найдено данных приложения');
  if (!confirm('Импорт заменит текущие данные (журнал, избранное, прогресс, расчёты). Если они нужны — сначала сделайте экспорт. Продолжить?')) return;
  Object.assign(state, clean); applyThemeAndFont();
  toast(saveState() ? 'Данные импортированы' : 'Импортировано, но не сохранено на устройстве'); render();
}
