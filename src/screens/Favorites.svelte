<script>
  import { ARTICLES } from '../data/index.js';
  import { state } from '../store.svelte.js';
  import { navigate } from '../router.js';
  import ArticleCards from '../components/ArticleCards.svelte';

  const favArts = $derived(ARTICLES.filter(a => state.favIds.includes(a.id)));
</script>

<h1 class="screen-title">Сохранённое</h1><p class="sub">Избранные статьи: {favArts.length}</p>
{#if favArts.length}
  <ArticleCards list={favArts} />
{:else}
  <div class="card" style="text-align:center;padding:24px;">
    <div style="font-size:1.8rem;">☆</div>
    <p>В избранном пока нет статей. Откройте любую статью и нажмите «В избранное».</p>
    <button class="btn" onclick={() => navigate('catalog', 'ALL')}>Перейти к статьям</button>
  </div>
{/if}
