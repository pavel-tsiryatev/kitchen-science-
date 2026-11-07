<script>
  /** Ингредиенты рецепта с пересчётом на другое число порций и кнопкой «В список покупок» */
  import { state as app, saveState } from '../store.svelte.js';
  import { scaleIngredients, fmtQty, addToList } from '../ingredients.js';
  import { navigate } from '../router.js';
  import { toast } from '../toast.js';
  import Icon from './Icon.svelte';
  import { DAYS, addToMenu } from '../menu.js';

  let { article } = $props();
  const ing = $derived(article.ingredients);
  let added = $state(false);
  // выбранное число порций хранится в общем состоянии: его видит и режим «Готовлю»
  const servings = $derived(app.servingsFor[article.id] || ing.servings);
  const items = $derived(scaleIngredients(ing, servings));
  const changed = $derived(servings !== ing.servings);

  function step(d) { app.servingsFor[article.id] = Math.min(50, Math.max(1, servings + d)); added = false; }
  let pickDay = $state(false), inMenu = $state(false);
  function toMenu(day, label) {
    app.menu = addToMenu(app.menu, day, article.id, servings);
    saveState(); pickDay = false; inMenu = true;
    toast(`Добавлено в меню: ${label}, ${servings} порц.`);
  }
  function addAll() {
    app.shopping = addToList(app.shopping, items, article.id);
    saveState(); added = true;
    toast(`Добавлено в список покупок: ${items.length}`);
  }
</script>

<section class="card ingr" aria-labelledby="ingr-h">
  <div class="ingr-head">
    <h3 id="ingr-h">Ингредиенты{#if ing.title}<small> · {ing.title}</small>{/if}</h3>
    <div class="ingr-serv" role="group" aria-label="Число порций">
      <button class="icon-btn sm" onclick={() => step(-1)} disabled={servings <= 1} aria-label="Меньше порций">−</button>
      <span aria-live="polite"><b>{servings}</b> {servings % 10 === 1 && servings % 100 !== 11 ? 'порция' : [2, 3, 4].includes(servings % 10) && ![12, 13, 14].includes(servings % 100) ? 'порции' : 'порций'}</span>
      <button class="icon-btn sm" onclick={() => step(1)} disabled={servings >= 50} aria-label="Больше порций">+</button>
    </div>
  </div>
  <ul class="ingr-list">
    {#each items as it (it.name)}
      <li><span>{it.name}</span><b>{fmtQty(it.qty, it.unit)}</b></li>
    {/each}
  </ul>
  {#if changed}<p class="ingr-note">Количества в шагах рецепта ниже указаны на {ing.servings} — ориентируйтесь на этот список.</p>{/if}
  <div class="ingr-actions">
    <button class="btn" onclick={addAll}><Icon name="cart" size={18} /><span>В список покупок</span></button>
    <button class="btn outline" onclick={() => navigate('cook', article.id)}><Icon name="pan" size={18} /><span>Готовлю</span></button>
    <button class="btn outline" onclick={() => pickDay = !pickDay} aria-expanded={pickDay}><Icon name="clock" size={18} /><span>В меню</span></button>
    {#if added}<button class="link" onclick={() => navigate('shopping')}>Открыть список →</button>{/if}
    {#if inMenu}<button class="link" onclick={() => navigate('menu')}>Открыть меню →</button>{/if}
  </div>
  {#if pickDay}
    <div class="menu-days" role="group" aria-label="День недели">
      {#each DAYS as [d, short, full] (d)}<button class="pill" onclick={() => toMenu(d, full)} aria-label={full}>{short}</button>{/each}
    </div>
  {/if}
</section>
