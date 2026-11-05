<script>
  import { ARTICLES, SECTIONS } from '../data/index.js';
  import { state } from '../store.svelte.js';
  import { normQ } from '../utils.js';
  import ArticleCards from '../components/ArticleCards.svelte';

  // Поисковый индекс считается один раз, а не при каждом нажатии клавиши
  const HAY = new Map(ARTICLES.map(a => [a.id, normQ([a.title, a.idea, a.what, a.why, a.factors, a.practice, a.mistakes, a.experiment, a.summary, a.quiz.q].join(' '))]));

  function secMatch(a, f) { return f === 'ALL' || f === 'UNREAD' || (f === 'TECH' ? 'ABCDF'.includes(a.sec) : a.sec === f); }

  const filtered = $derived.by(() => {
    const q = normQ(state.searchQuery), f = state.secFilter;
    return ARTICLES.filter(a => {
      if (!secMatch(a, f)) return false;
      if (f === 'UNREAD' && state.readIds.includes(a.id)) return false;
      return !q || HAY.get(a.id).includes(q);
    });
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

<div id="catalogListContainer">
  <ArticleCards list={filtered} />
</div>
