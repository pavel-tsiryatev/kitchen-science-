<script>
  import { ARTICLES, SECTIONS, GLOSSARY } from '../data/index.js';
  import { navigate } from '../router.js';
  import { searchGlossary } from '../glossary.js';
  import TermSheet from '../components/TermSheet.svelte';
  import { state as app } from '../store.svelte.js'; // не «state»: имя конфликтует с руной $state
  import { buildIndex, search, queryStems } from '../search.js';
  import ArticleCards from '../components/ArticleCards.svelte';

  // Поисковый индекс (основы слов по полям) строится один раз
  const INDEX = buildIndex(ARTICLES);

  function secMatch(a, f) { return f === 'ALL' || f === 'UNREAD' || (f === 'TECH' ? 'ABCDF'.includes(a.sec) : a.sec === f); }

  const stems = $derived(queryStems(app.searchQuery));
  // null — запроса нет; иначе статьи по убыванию релевантности
  const found = $derived(search(INDEX, app.searchQuery));
  // Термины глоссария, подходящие под запрос (по названию и синонимам)
  const terms = $derived(found ? searchGlossary(GLOSSARY, stems).slice(0, 3) : []);
  let openTerm = $state(null);
  const filtered = $derived.by(() => {
    const f = app.secFilter;
    return (found ? found.map(r => r.article) : ARTICLES).filter(a =>
      secMatch(a, f) && !(f === 'UNREAD' && app.readIds.includes(a.id)));
  });
</script>

<h1 class="screen-title">Библиотека</h1><p class="sub">Знания, которые делают вкуснее</p>
<button class="link gl-entry" onclick={() => navigate('glossary')}>Глоссарий: {GLOSSARY.length} терминов простыми словами →</button>
<input type="search" id="catSearchInput" class="search-box"
  placeholder="Поиск по {ARTICLES.length} статьям, терминам и процессам..." aria-label="Поиск по {ARTICLES.length} статьям, терминам и процессам..."
  bind:value={app.searchQuery}>

<div class="pill-bar">
  <button class="pill" class:active={app.secFilter === 'ALL'} onclick={() => app.secFilter = 'ALL'}>Все ({ARTICLES.length})</button>
  <button class="pill" class:active={app.secFilter === 'UNREAD'} onclick={() => app.secFilter = 'UNREAD'}>Непрочитанные</button>
  {#each SECTIONS as s (s.id)}
    <button class="pill" class:active={app.secFilter === s.id} onclick={() => app.secFilter = s.id}>
      {s.letter}. {s.title}
    </button>
  {/each}
</div>

{#if terms.length}
  <div class="card search-terms">
    <div class="search-terms-h">Термины</div>
    {#each terms as t (t.id)}
      <button class="term-hit" onclick={() => openTerm = t.id}><b>{t.term}</b> — {t.definition}</button>
    {/each}
  </div>
{/if}

{#if found && filtered.length}
  <p class="search-count" aria-live="polite">Найдено: {filtered.length}{filtered.length > 1 ? " — сначала самые подходящие" : ""}</p>
{/if}

<div id="catalogListContainer">
  <ArticleCards list={filtered} stems={found ? stems : []} />
</div>

{#if openTerm}
  <TermSheet id={openTerm} onclose={() => openTerm = null} />
{/if}
