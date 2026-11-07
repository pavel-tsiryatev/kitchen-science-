<script>
  /** Справочные таблицы: температура готовности, сроки хранения, крупы, замены */
  import { TABLES, ARTICLES } from '../data/index.js';
  import { navigate } from '../router.js';

  const title = id => ARTICLES.find(a => a.id === id)?.title.split(':')[0];
</script>

<h1 class="screen-title">Таблицы</h1><p class="sub">Температуры, сроки хранения, меры, крупы и замены — под рукой</p>
<div class="pill-bar" role="navigation" aria-label="Таблицы">
  {#each TABLES as t (t.id)}<a class="pill" href="#tbl-{t.id}" onclick={e => { e.preventDefault(); document.getElementById('tbl-' + t.id)?.scrollIntoView({ behavior: 'smooth' }); }}>{t.title}</a>{/each}
</div>

{#each TABLES as t (t.id)}
  <section class="card ref-table" id="tbl-{t.id}">
    <h2>{t.title}</h2>
    <p class="ref-intro">{t.intro}</p>
    <div class="ref-scroll">
      <table class="comp-table">
        <thead><tr>{#each t.headers as h}<th>{h}</th>{/each}</tr></thead>
        <tbody>{#each t.rows as r}<tr>{#each r as cell, i}<td class:ref-key={i === 1}>{cell}</td>{/each}</tr>{/each}</tbody>
      </table>
    </div>
    <p class="ref-note">{t.note}</p>
    {#if t.articles.length}
      <div class="ref-more">Подробнее:
        {#each t.articles as id, i (id)}{#if title(id)}<button class="link" onclick={() => navigate('article', id)}>{title(id)}</button>{i < t.articles.length - 1 ? ' · ' : ''}{/if}{/each}
      </div>
    {/if}
    {#if t.sources.length}
      <details class="ref-src"><summary>Источники</summary>
        <ul>{#each t.sources as s}<li>{s.title}{#if s.publisher} — {s.publisher}{/if}{#if s.doi} · DOI <a href="https://doi.org/{s.doi}" target="_blank" rel="noopener">{s.doi}</a>{/if}</li>{/each}</ul>
      </details>
    {/if}
  </section>
{/each}
