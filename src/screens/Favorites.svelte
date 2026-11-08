<script>
  import { ARTICLES } from '../data/index.js';
  import { state, findDish, dishScreen } from '../store.svelte.js';
  import { fmtDate } from '../cooked.js';
  import { navigate } from '../router.js';
  import ArticleCards from '../components/ArticleCards.svelte';
  import { recipeArticle } from '../myRecipes.js';
  import { perServing } from '../nutrition.js';

  const favArts = $derived(ARTICLES.filter(a => state.favIds.includes(a.id)));
  // история: последние 15 записей о блюдах, которые ещё существуют
  const history = $derived(state.cooked.filter(x => findDish(x.id)).slice(0, 15));
  const kcal = r => (r.items.length ? perServing({ servings: r.servings, items: r.items })?.kcal : null);
</script>

<h1 class="screen-title">Сохранённое</h1>

<div class="eyebrow"><h3>Мои рецепты</h3><button class="link" onclick={() => navigate('myedit', 'new')}>+ Новый рецепт</button></div>
{#if state.myRecipes.length}
  <div class="my-list">
    {#each state.myRecipes as r (r.id)}
      <button class="card card-clickable my-card" onclick={() => navigate('myrecipe', r.id)}>
        <b>{r.title}</b>
        <small>{r.servings} порц. · ингредиентов: {r.items.length} · шагов: {r.steps.length}{kcal(r) ? ` · ≈ ${kcal(r)} ккал` : ''}</small>
      </button>
    {/each}
  </div>
{:else}
  <div class="card my-empty">
    <p>Добавьте свои блюда: для них заработают пересчёт порций, список покупок, меню на неделю, режим «Готовлю» с таймерами и примерная калорийность.</p>
    <button class="btn" onclick={() => navigate('myedit', 'new')}>Добавить рецепт</button>
  </div>
{/if}

{#if history.length}
  <div class="eyebrow"><h3>Что я готовил</h3><span class="mono-s">{state.cooked.length}</span></div>
  <div class="card cooked-hist">
    {#each history as x (x.id + x.date)}
      <button onclick={() => navigate(dishScreen(x.id), x.id)}><span>{findDish(x.id).title.split(':')[0]}</span><small>{x.rating ? '★'.repeat(x.rating) + ' · ' : ''}{fmtDate(x.date)}</small></button>
    {/each}
  </div>
{/if}

<div class="eyebrow"><h3>Избранные статьи</h3><span class="mono-s">{favArts.length}</span></div>
{#if favArts.length}
  <ArticleCards list={favArts} />
{:else}
  <div class="card" style="text-align:center;padding:24px;">
    <div style="font-size:1.8rem;">☆</div>
    <p>В избранном пока нет статей. Откройте любую статью и нажмите «В избранное».</p>
    <button class="btn" onclick={() => navigate('catalog', 'ALL')}>Перейти к статьям</button>
  </div>
{/if}
