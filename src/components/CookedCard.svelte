<script>
  /** «Приготовил»: отметка с оценкой и короткая сводка — сколько раз и когда готовили */
  import { state as app, saveState } from '../store.svelte.js';
  import { addCooked, cookedStats, fmtDate } from '../cooked.js';
  import { toast } from '../toast.js';

  let { id, open = false } = $props();
  let rating = $state(open);
  const stats = $derived(cookedStats(app.cooked, id));
  const timesWord = n => (n % 10 === 1 && n % 100 !== 11 ? 'раз' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'раза' : 'раз');

  function mark(r) {
    app.cooked = addCooked(app.cooked, id, r);
    saveState(); rating = false;
    toast(r ? `Отмечено: приготовили, оценка ${r} из 5` : 'Отмечено: приготовили');
  }
</script>

<section class="card cooked" aria-label="Приготовил">
  <div class="cooked-row">
    <span class="cooked-info">
      {#if stats}Готовили {stats.times} {timesWord(stats.times)} · последний раз {fmtDate(stats.last)}{#if stats.rating} · <span class="stars-static" aria-label="оценка {stats.rating} из 5">{'★'.repeat(stats.rating)}{'☆'.repeat(5 - stats.rating)}</span>{/if}
      {:else}Ещё не готовили{/if}
    </span>
    {#if !rating}<button class="btn outline sm" onclick={() => rating = true}>✓ Приготовил</button>{/if}
  </div>
  {#if rating}
    <div class="cooked-rate">
      <span>Как получилось?</span>
      <div class="stars" role="group" aria-label="Оценка">
        {#each [1, 2, 3, 4, 5] as r}<button class="star" onclick={() => mark(r)} aria-label="Оценка {r} из 5">★</button>{/each}
      </div>
      <button class="link" onclick={() => mark(null)}>Без оценки</button>
    </div>
  {/if}
</section>
