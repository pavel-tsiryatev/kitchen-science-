<script>
  import { SECTIONS } from '../data/index.js';
  import { state } from '../store.svelte.js';
  import { navigate } from '../router.js';
  import { readMin, tileOf, glyphOf } from '../utils.js';
  import Icon from './Icon.svelte';

  let { list } = $props();

  function resetFilters() { state.searchQuery = ''; state.secFilter = 'ALL'; }
  function onKey(e, id) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('article', id); } }
</script>

{#if !list.length}
  <div class="card" style="text-align:center;padding:28px;"><strong>Ничего не найдено</strong>
    <p style="color:var(--text-muted);font-size:0.88rem;">Измените запрос или сбросьте фильтры.</p>
    <button class="btn outline" onclick={resetFilters}>Сбросить фильтры</button></div>
{:else}
  {#each list as a (a.id)}
    {@const sec = SECTIONS.find(s => s.id === a.sec)}
    <div class="card card-ed card-clickable" role="button" tabindex="0" onclick={() => navigate('article', a.id)} onkeydown={e => onKey(e, a.id)}>
      <div class="tile {tileOf(a.sec)}"><Icon name={glyphOf(a.sec)} size={22} /></div>
      <div style="min-width:0"><div class="ed-t">{a.title}</div><div class="ed-d">{a.idea}</div>
      <div class="ed-m">{readMin(a)} мин · {sec.title}{state.readIds.includes(a.id) ? ' · ✓ изучено' : ''}{state.favIds.includes(a.id) ? ' · ★' : ''}</div></div></div>
  {/each}
{/if}
