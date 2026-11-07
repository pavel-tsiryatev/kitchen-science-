<script>
  /** Плашка «Доступна новая версия» (Android). Проверка при запуске и по кнопке в настройках. */
  import { onMount } from 'svelte';
  import { isNative } from '../native.js';
  import { checkUpdate, skipVersion } from '../update.js';
  import { updateInfo } from '../update-state.svelte.js';

  onMount(async () => { if (isNative) { const up = await checkUpdate(); if (up) updateInfo.value = up; } });
  function later() { skipVersion(updateInfo.value.version); updateInfo.value = null; }
</script>

{#if updateInfo.value}
  <div class="update-bar" role="status">
    <span>Доступна новая версия <b>{updateInfo.value.version}</b></span>
    <a class="btn" href={updateInfo.value.url} target="_blank" rel="noopener">Скачать APK</a>
    <button class="link" onclick={later}>Не сейчас</button>
  </div>
{/if}
