// Мост к нативным возможностям Android (Capacitor). В браузере используются веб-аналоги.
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';

export const isNative = Capacitor.isNativePlatform();

// --- Постоянное хранилище ---
// На Android данные лежат в SharedPreferences (Preferences): их не стирает очистка кэша WebView.
// В браузере — localStorage, как раньше.
export async function readStored(key) {
  if (!isNative) return localStorage.getItem(key);
  const { value } = await Preferences.get({ key });
  if (value !== null) return value;
  // Миграция: данные старых версий приложения лежат в localStorage WebView
  const legacy = localStorage.getItem(key);
  if (legacy !== null) await Preferences.set({ key, value: legacy });
  return legacy;
}

let pending = null, timer = null, onFail = null;
async function flush() {
  clearTimeout(timer); timer = null;
  if (pending === null) return;
  const [key, value] = pending; pending = null;
  try { await Preferences.set({ key, value }); } catch (e) { if (onFail) onFail(e); }
}
/** Пишет в Preferences не чаще раза в 300 мс (калькулятор сохраняет на каждое нажатие). */
export function writeStoredNative(key, value, failHandler) {
  onFail = failHandler; pending = [key, value];
  clearTimeout(timer); timer = setTimeout(flush, 300);
}
if (isNative) {
  // При сворачивании приложения сразу сбрасываем отложенную запись
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
}

// --- Сохранение файла резервной копии ---
/** Android: файл во временной папке + системное окно «Поделиться». Браузер: обычное скачивание. */
export async function saveTextFile(name, text) {
  if (isNative) {
    const { uri } = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: 'Резервная копия «Кухня»', dialogTitle: 'Сохранить резервную копию', files: [uri] });
    return 'shared';
  }
  const u = URL.createObjectURL(new Blob([text], { type: 'application/json' })), l = document.createElement('a');
  l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000);
  return 'downloaded';
}

// --- Кнопка и жест «Назад» ---
/** На Android «Назад» возвращает на предыдущий экран приложения; выход — только с главной. */
export function initBackButton(handleBack) {
  if (!isNative) return;
  App.addListener('backButton', () => { if (!handleBack()) App.exitApp(); });
}
