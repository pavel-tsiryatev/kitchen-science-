<script>
  import { ARTICLES, SECTIONS, GLOSSARY, DISH_GROUPS } from '../data/index.js';
  import { navigate } from '../router.js';
  import { searchGlossary } from '../glossary.js';
  import TermSheet from '../components/TermSheet.svelte';
  import { state as app } from '../store.svelte.js'; // не «state»: имя конфликтует с руной $state
  import { indexFor, search, queryStems } from '../search.js';
  import ArticleCards from '../components/ArticleCards.svelte';
  import { DIETS, fitsDiets } from '../diet.js';
  import { saveState } from '../store.svelte.js';


  function secMatch(a, f) { return f === 'ALL' || f === 'UNREAD' || (f === 'TECH' ? 'ABCDF'.includes(a.sec) : a.sec === f); }

  const stems = $derived(queryStems(app.searchQuery));
  // null — запроса нет; иначе статьи по убыванию релевантности
  // поисковый индекс строится при первом запросе и дальше берётся из кэша
  const found = $derived(queryStems(app.searchQuery).length ? search(indexFor(ARTICLES), app.searchQuery) : null);
  // Термины глоссария, подходящие под запрос (по названию и синонимам)
  const terms = $derived(found ? searchGlossary(GLOSSARY, stems).slice(0, 3) : []);
  let openTerm = $state(null);
  // Подгруппы «Популярных блюд» с количеством статей
  const DISHES = ARTICLES.filter(a => a.sec === 'I');
  const groupCount = id => DISHES.filter(a => a.group === id).length;
  const filtered = $derived.by(() => {
    const f = app.secFilter, g = f === 'I' ? app.dishGroup : 'ALL';
    return (found ? found.map(r => r.article) : ARTICLES).filter(a =>
      secMatch(a, f) && !(f === 'UNREAD' && app.readIds.includes(a.id)) && (g === 'ALL' || a.group === g) &&
      (f !== 'I' || fitsDiets(a, app.diet)));
  });
  function setSec(id) { app.secFilter = id; app.dishGroup = 'ALL'; }
  function toggleDiet(id) { app.diet = app.diet.includes(id) ? app.diet.filter(x => x !== id) : [...app.diet, id]; saveState(); }
</script>

<h1 class="screen-title">Библиотека</h1><p class="sub">Знания, которые делают вкуснее</p>
<div class="ref-entries">
  <button class="link gl-entry" onclick={() => navigate('glossary')}>Глоссарий: {GLOSSARY.length} терминов простыми словами →</button>
  <button class="link gl-entry" onclick={() => navigate('tables')}>Таблицы: температуры, варка, жарка, сроки, меры и веса, замены →</button>
</div>
<input type="search" id="catSearchInput" class="search-box"
  placeholder="Поиск по {ARTICLES.length} статьям, продуктам и терминам..." aria-label="Поиск по {ARTICLES.length} статьям, продуктам и терминам..."
  bind:value={app.searchQuery}>

<div class="pill-bar">
  <button class="pill" class:active={app.secFilter === 'ALL'} onclick={() => setSec('ALL')}>Все ({ARTICLES.length})</button>
  <button class="pill" class:active={app.secFilter === 'UNREAD'} onclick={() => setSec('UNREAD')}>Непрочитанные</button>
  {#each SECTIONS as s (s.id)}
    <button class="pill" class:active={app.secFilter === s.id} onclick={() => setSec(s.id)}>
      {s.letter}. {s.title}
    </button>
  {/each}
</div>

{#if app.secFilter === 'I'}
  <div class="pill-bar sub-pills" role="group" aria-label="Виды блюд">
    <button class="pill" class:active={app.dishGroup === 'ALL'} onclick={() => app.dishGroup = 'ALL'}>Все блюда ({DISHES.length})</button>
    {#each DISH_GROUPS as g (g.id)}
      <button class="pill" class:active={app.dishGroup === g.id} onclick={() => app.dishGroup = g.id}>{g.title} ({groupCount(g.id)})</button>
    {/each}
  </div>
  <div class="pill-bar sub-pills diet-pills" role="group" aria-label="Ограничения по составу">
    {#each DIETS as d (d.id)}
      <button class="pill" class:active={app.diet.includes(d.id)} aria-pressed={app.diet.includes(d.id)} onclick={() => toggleDiet(d.id)}>{app.diet.includes(d.id) ? '✓ ' : ''}{d.title}</button>
    {/each}
  </div>
  {#if app.diet.length}
    <p class="diet-note">Отбор по составу рецепта. Проверяйте упаковки: в колбасе, соевом соусе, бульонных кубиках и готовых смесях бывают скрытые ингредиенты, а овсяные хлопья без глютена — только с такой пометкой.</p>
  {/if}
{/if}

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
