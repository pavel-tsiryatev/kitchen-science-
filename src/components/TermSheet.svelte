<script>
  /** Нижняя карточка с определением термина — открывается по нажатию на термин в статье */
  import { GLOSSARY, ARTICLES } from '../data/index.js';
  import { navigate, onBackClose } from '../router.js';

  let { id, current = null, onclose } = $props();
  const t = $derived(GLOSSARY.find(x => x.id === id));
  const more = $derived((t?.articles || []).filter(x => x !== current).map(x => ARTICLES.find(a => a.id === x)).filter(Boolean));

  function onKey(e) { if (e.key === 'Escape') onclose(); }
  // Жест/кнопка «Назад» на Android закрывает карточку, а не уходит со страницы
  $effect(() => onBackClose(() => onclose()));
</script>

<svelte:window onkeydown={onKey} />

{#if t}
  <button class="sheet-backdrop" aria-label="Закрыть" onclick={onclose}></button>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-term">
    <div class="sheet-head">
      <h3 id="sheet-term">{t.term}</h3>
      <button class="icon-btn" aria-label="Закрыть определение" onclick={onclose}>✕</button>
    </div>
    <p class="sheet-def">{t.definition}</p>
    {#if more.length}
      <div class="sheet-more">Подробнее:
        {#each more as m (m.id)}<button class="link" onclick={() => navigate('article', m.id)}>{m.title}</button>{/each}
      </div>
    {/if}
    <button class="btn outline full" onclick={() => navigate('glossary', t.id)}>Открыть глоссарий</button>
  </div>
{/if}
