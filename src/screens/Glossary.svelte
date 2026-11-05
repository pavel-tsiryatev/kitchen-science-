<script>
  import { tick } from 'svelte';
  import { GLOSSARY, ARTICLES } from '../data/index.js';
  import { state as app } from '../store.svelte.js'; // не «state»: имя конфликтует с руной $state
  import { navigate } from '../router.js';
  import { queryStems, norm } from '../search.js';
  import { searchGlossary } from '../glossary.js';

  let query = $state('');
  const stems = $derived(queryStems(query));
  // Поиск по названию и синонимам (в любой форме) или по тексту определения
  const shown = $derived.by(() => {
    if (!query.trim()) return GLOSSARY;
    const byName = new Set(searchGlossary(GLOSSARY, stems).map(t => t.id));
    const q = norm(query.trim());
    return GLOSSARY.filter(t => byName.has(t.id) || norm(t.definition).includes(q));
  });
  // Группы по первой букве
  const groups = $derived.by(() => {
    const g = new Map();
    for (const t of shown) { const l = t.term[0].toUpperCase(); if (!g.has(l)) g.set(l, []); g.get(l).push(t); }
    return [...g];
  });
  const title = id => ARTICLES.find(a => a.id === id)?.title;

  // Переход к конкретному термину (из карточки в статье)
  $effect(() => {
    const id = app.glossTerm;
    if (!id) return;
    tick().then(() => {
      const el = document.getElementById('term-' + id);
      if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); }
    });
  });
</script>

<h1 class="screen-title">Глоссарий</h1><p class="sub">{GLOSSARY.length} терминов простыми словами</p>
<input type="search" class="search-box" placeholder="Найти термин…" aria-label="Найти термин" bind:value={query}>

{#if !shown.length}
  <div class="card" style="text-align:center;padding:24px;"><strong>Термин не найден</strong>
    <p style="color:var(--text-muted);font-size:0.88rem;">Попробуйте поискать в статьях.</p>
    <button class="btn outline" onclick={() => { app.searchQuery = query; navigate('catalog', 'ALL'); }}>Искать в статьях</button></div>
{/if}

{#each groups as [letter, terms] (letter)}
  <div class="gl-letter">{letter}</div>
  {#each terms as t (t.id)}
    <div class="card gl-term" id="term-{t.id}" class:flash={app.glossTerm === t.id}>
      <h3>{t.term}{#if t.aliases.length}<span class="gl-alias">&nbsp;· {t.aliases.join(', ')}</span>{/if}</h3>
      <p>{t.definition}</p>
      {#if t.articles.length}
        <div class="gl-links">
          {#each t.articles as id (id)}<button class="link" onclick={() => navigate('article', id)}>{title(id)}</button>{/each}
        </div>
      {/if}
    </div>
  {/each}
{/each}
