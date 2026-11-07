<script>
  import { SECTIONS } from '../data/index.js';
  import { state } from '../store.svelte.js';
  import { navigate } from '../router.js';
  import { readMin, tileOf, glyphOf } from '../utils.js';
  import { highlight, snippet, ingredientHits } from '../search.js';
  import Marked from './Marked.svelte';
  import Icon from './Icon.svelte';

  let { list, stems = [] } = $props();
  // Фрагмент текста показываем, только если совпадения нет в заголовке и вводной фразе
  const hasHit = (text) => highlight(text, stems).some(p => p.hit);
  const extract = a => (stems.length && !hasHit(a.title) && !hasHit(a.idea)) ? snippet(a, stems) : null;

  function resetFilters() { state.searchQuery = ''; state.secFilter = 'ALL'; state.dishGroup = 'ALL'; }
  function onKey(e, id) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('article', id); } }
</script>

{#if !list.length}
  <div class="card" style="text-align:center;padding:28px;"><strong>Ничего не найдено</strong>
    <p style="color:var(--text-muted);font-size:0.88rem;">Измените запрос или сбросьте фильтры.</p>
    <button class="btn outline" onclick={resetFilters}>Сбросить фильтры</button></div>
{:else}
  {#each list as a (a.id)}
    {@const sec = SECTIONS.find(s => s.id === a.sec)}
    {@const ex = extract(a)}
    <div class="card card-ed card-clickable" role="button" tabindex="0" onclick={() => navigate('article', a.id)} onkeydown={e => onKey(e, a.id)}>
      <div class="tile {tileOf(a.sec)}"><Icon name={glyphOf(a.sec)} size={22} /></div>
      <div style="min-width:0"><div class="ed-t"><Marked text={a.title} {stems} /></div><div class="ed-d"><Marked text={a.idea} {stems} /></div>
      {#if stems.length && ingredientHits(a, stems).length}<div class="ed-s ed-ingr">В составе: <Marked text={ingredientHits(a, stems).join(', ')} {stems} /></div>
      {:else if ex}<div class="ed-s">«<Marked text={ex} {stems} />»</div>{/if}
      <div class="ed-m">{readMin(a)} мин · {sec.title}{state.readIds.includes(a.id) ? ' · ✓ изучено' : ''}{state.favIds.includes(a.id) ? ' · ★' : ''}</div></div></div>
  {/each}
{/if}
