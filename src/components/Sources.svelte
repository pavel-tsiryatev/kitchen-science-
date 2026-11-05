<script>
  /** Список источников статьи: DOI и ISBN — ссылками, старые текстовые — как есть */
  import { EVIDENCE_LABEL } from '../data/index.js';
  let { article: a } = $props();

  const link = s => s.doi ? `https://doi.org/${s.doi}` : s.url || (s.isbn ? `https://openlibrary.org/isbn/${s.isbn}` : null);
</script>

<div class="card sources">
  <h4 style="margin:0 0 8px 0;">Источники</h4>
  <ol>
    {#each a.sources as s, i (i)}
      <li>
        {#if s.text}
          {s.text}
        {:else}
          {s.authors} ({s.year}). <i>{s.title}</i>.{#if s.published}&nbsp;{s.published}.{/if}
          {#if link(s)}
            <a href={link(s)} target="_blank" rel="noopener noreferrer">{s.doi ? `DOI ${s.doi}` : s.isbn ? `ISBN ${s.isbn}` : 'ссылка'}</a>
          {/if}
          {#if s.note}<div class="src-note">{s.note}</div>{/if}
        {/if}
      </li>
    {/each}
  </ol>
  {#if a.evidence === 'unverified'}
    <p class="src-meta">Источники этой статьи ещё не сверены по научным базам.</p>
  {:else}
    <p class="src-meta">{EVIDENCE_LABEL[a.evidence]}. Источники сверены{a.reviewed ? ` ${a.reviewed.split('-').reverse().join('.')}` : ''}.</p>
  {/if}
</div>
