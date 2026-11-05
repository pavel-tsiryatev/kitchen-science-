import { state, SCHEMA, saveState, snapshot, sanitizeSaved, applyThemeAndFont } from './store.svelte.js';
import { toast } from './toast.js';
import { saveTextFile } from './native.js';

// --- резервная копия: экспорт / импорт с проверкой ---
function backupText() { return JSON.stringify({ app: 'kuhnya-nauka-vkusa', exportedAt: new Date().toISOString(), data: snapshot() }, null, 2); }

export function exportBackup(area) {
  area.value = backupText(); area.focus(); area.select();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(area.value).then(() => toast('Копия скопирована в буфер обмена'), () => toast('Текст выделен в поле: скопируйте вручную'));
    else toast(document.execCommand('copy') ? 'Копия скопирована' : 'Скопируйте текст из поля вручную');
  } catch (e) { toast('Скопируйте текст из поля вручную'); }
}

export async function downloadBackup() {
  const name = 'kuhnya-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  try {
    const how = await saveTextFile(name, backupText());
    if (how === 'downloaded') toast('Файл сформирован (проверьте папку «Загрузки»)');
  } catch (e) {
    // Пользователь закрыл окно «Поделиться» — это не ошибка
    if (/cancel/i.test(String(e && e.message))) return;
    toast('Не удалось сохранить файл: используйте «Копировать JSON»');
  }
}

/** Импорт из выбранного файла .json */
export function importBackupFile(input, area) {
  const f = input.files && input.files[0]; input.value = '';
  if (!f) return;
  if (f.size > 5e6) return toast('Файл слишком большой для резервной копии');
  const r = new FileReader();
  r.onload = () => { area.value = String(r.result || ''); importBackup(area); };
  r.onerror = () => toast('Не удалось прочитать файл');
  r.readAsText(f);
}

export function importBackup(area) {
  const txt = area.value.trim();
  if (!txt) return toast('Вставьте JSON резервной копии в поле');
  let obj; try { obj = JSON.parse(txt); } catch (e) { return toast('Это не JSON: текст повреждён или вставлен не полностью'); }
  const data = obj && obj.data && typeof obj.data === 'object' ? obj.data : obj;
  if (data && data.schema > SCHEMA) return toast('Копия создана более новой версией приложения');
  const clean = sanitizeSaved(data);
  if (!clean || !Object.keys(clean).length) return toast('В тексте не найдено данных приложения');
  if (!confirm('Импорт заменит текущие данные (журнал, избранное, прогресс, расчёты). Если они нужны — сначала сделайте экспорт. Продолжить?')) return;
  Object.assign(state, clean); applyThemeAndFont(); area.value = '';
  toast(saveState() ? 'Данные импортированы' : 'Импортировано, но не сохранено на устройстве');
}

export function resetProgress() {
  if (confirm('Сбросить отметки о прочитанных статьях и тестах? Записи журнала и избранное сохранятся.')) {
    state.readIds = [];
    state.quizScores = {};
    saveState();
  }
}
