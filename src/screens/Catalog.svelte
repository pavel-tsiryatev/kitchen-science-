<script>
  import { ARTICLES, SECTIONS } from '../data/index.js';
  import { state } from '../store.svelte.js';
  import { buildIndex, search, queryStems } from '../search.js';
  import ArticleCards from '../components/ArticleCards.svelte';

  // Поисковый индекс (основы слов по полям) строится один раз
  const INDEX = buildIndex(ARTICLES);

  function secMatch(a, f) { return f === 'ALL' || f === 'UNREAD' || (f === 'TECH' ? 'ABCDF'.includes(a.sec) : a.sec === f); }

  const stems = $derived(queryStems(state.searchQuery));
  // null — запроса нет; иначе статьи по убыванию релевантности
  const found = $derived(search(INDEX, state.searchQuery));
  const filtered = $derived.by(() => {
    const f = state.secFilter;
    return (found ? found.map(r => r.article) : ARTICLES).filter(a =>
      secMatch(a, f) && !(f === 'UNREAD' && state.readIds.includes(a.id)));
  });
</script>

<h1 class="screen-title">Библиотека</h1><p class="sub">Знания, которые делают вкуснее</p>
<input type="search" id="catSearchInput" class="search-box"
  placeholder="Поиск по {ARTICLES.length} статьям, терминам и процессам..." aria-label="Поиск по {ARTICLES.length} статьям, терминам и процессам..."
  bind:value={state.searchQuery}>

<div class="pill-bar">
  <button class="pill" class:active={state.secFilter === 'ALL'} onclick={() => state.secFilter = 'ALL'}>Все ({ARTICLES.length})</button>
  <button class="pill" class:active={state.secFilter === 'UNREAD'} onclick={() => state.secFilter = 'UNREAD'}>Непрочитанные</button>
  {#each SECTIONS as s (s.id)}
    <button class="pill" class:active={state.secFilter === s.id} onclick={() => state.secFilter = s.id}>
      {s.letter}. {s.title}
    </button>
  {/each}
</div>

{#if found && filtered.length}
  <p class="search-count" aria-live="polite">Найдено: {filtered.length}{filtered.length > 1 ? " — сначала самые подходящие" : ""}</p>
{/if}

<div id="catalogListContainer">
  <ArticleCards list={filtered} stems={found ? stems : []} />
</div>
