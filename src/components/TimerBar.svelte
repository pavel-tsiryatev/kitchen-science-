<script>
  /** Активные таймеры поверх любого экрана, над нижним меню */
  import { onDestroy } from 'svelte';
  import { timers, tick, cancelTimer, fmtLeft, ring } from '../timers.svelte.js';
  import { navigate } from '../router.js';

  let iv = null;
  $effect(() => {
    if (timers.list.length && !iv) {
      tick();
      iv = setInterval(() => { if (tick().length) ring(); }, 1000);
    } else if (!timers.list.length && iv) { clearInterval(iv); iv = null; }
  });
  onDestroy(() => clearInterval(iv));
</script>

{#if timers.list.length}
  <!-- место под плашками, чтобы они не закрывали конец страницы -->
  <div aria-hidden="true" style="height:{timers.list.length * 62}px"></div>
  <div class="timer-bar" role="region" aria-label="Таймеры">
    {#each timers.list as t (t.id)}
      <div class="timer" class:done={t.done}>
        <button class="timer-main" onclick={() => t.articleId && navigate('article', t.articleId)}>
          <span class="timer-t">{t.done ? 'Готово!' : fmtLeft(t.end - timers.now)}</span>
          <span class="timer-n">{t.title} · {t.label}</span>
        </button>
        <button class="timer-x" onclick={() => cancelTimer(t.id)} aria-label={t.done ? 'Закрыть таймер' : 'Остановить таймер'}>{t.done ? 'ОК' : '✕'}</button>
      </div>
    {/each}
  </div>
{/if}
