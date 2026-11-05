<script>
  import { ARTICLES } from '../data/index.js';
  import { state, saveState, setTheme, setFontScale } from '../store.svelte.js';
  import { navigate } from '../router.js';
  import { exportBackup, downloadBackup, importBackup, importBackupFile, resetProgress } from '../backup.js';
  import { isNative } from '../native.js';

  const favArts = $derived(ARTICLES.filter(a => state.favIds.includes(a.id)));
  const SCALES = [[0.95, 'А-'], [1, '100%'], [1.12, 'А+'], [1.25, 'А++']];
  let area, fileInput;

  function unFav(id) { state.favIds.splice(state.favIds.indexOf(id), 1); saveState(); }
  function favKey(e, id) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('article', id); } }
</script>

<div class="card">
  <h3 style="margin:0 0 10px 0;">★ Избранные статьи ({favArts.length})</h3>
  {#each favArts as a (a.id)}
    <div style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
      <span style="font-weight:600;cursor:pointer;" role="button" tabindex="0" onclick={() => navigate('article', a.id)} onkeydown={e => favKey(e, a.id)}>{a.title}</span>
      <button class="icon-btn" aria-label="Убрать из избранного" onclick={() => unFav(a.id)}>✕</button>
    </div>
  {:else}
    <div style="font-size:0.88rem;color:var(--text-muted)">Вы пока не добавили статьи в избранное.</div>
  {/each}
</div>

<div class="card">
  <h3 style="margin:0 0 10px 0;">Оформление и читаемость</h3>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span>Цветовая тема</span>
    <div class="seg"><button class:on={state.theme === 'light'} onclick={() => setTheme('light')}>Светлая</button><button class:on={state.theme === 'dark'} onclick={() => setTheme('dark')}>Тёмная</button></div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <span>Размер шрифта</span>
    <div style="display:flex;gap:6px;">
      {#each SCALES as [v, t]}<button class="btn {state.fontScale === v ? '' : 'outline'}" onclick={() => setFontScale(v)}>{t}</button>{/each}
    </div>
  </div>
</div>

<div class="card">
  <h3 style="margin:0 0 10px 0;">Локальные данные (100% Офлайн)</h3>
  <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0;">
    Все ваши заметки в журнале, прочитанные статьи и избранное хранятся исключительно в памяти вашего смартфона.
  </p>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    <button class="btn outline" onclick={() => exportBackup(area)}>Копировать JSON</button>
    <button class="btn outline" onclick={downloadBackup}>{isNative ? 'Сохранить файл' : 'Скачать файл'}</button>
    <button class="btn outline" onclick={() => fileInput.click()}>Импорт из файла</button>
    <button class="btn outline" onclick={() => importBackup(area)}>Импорт из поля</button>
    <button class="btn outline" onclick={resetProgress}>Сбросить прогресс чтения</button>
  </div>
  <input bind:this={fileInput} type="file" accept=".json,application/json,text/plain" hidden onchange={e => importBackupFile(e.currentTarget, area)}>
  <textarea bind:this={area} id="backupArea" class="field" rows="3" style="margin-top:10px;" maxlength="1000000" aria-label="Резервная копия JSON" placeholder="Здесь появится резервная копия. Для импорта вставьте сюда JSON и нажмите «Импорт из поля»"></textarea>
</div>
