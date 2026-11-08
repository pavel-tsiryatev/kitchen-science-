<script>
  /** Список покупок: продукты из рецептов, отметки «куплено», «Поделиться» */
  import { state as app, saveState, findDish, dishScreen } from '../store.svelte.js';
  import { fmtQty, addToList, listText } from '../ingredients.js';
  import { navigate } from '../router.js';
  import { shareText } from '../native.js';
  import { toast } from '../toast.js';
  import Icon from '../components/Icon.svelte';

  const todo = $derived(app.shopping.filter(x => !x.done));
  const done = $derived(app.shopping.filter(x => x.done));
  const dishes = $derived([...new Set(app.shopping.flatMap(x => x.src || []))].map(findDish).filter(Boolean));
  let newItem = $state('');

  function toggle(x) { x.done = !x.done; saveState(); }
  function remove(x) { app.shopping = app.shopping.filter(y => y !== x); saveState(); }
  function clearDone() { app.shopping = app.shopping.filter(x => !x.done); saveState(); }
  function clearAll() { if (confirm('Очистить весь список покупок?')) { app.shopping = []; saveState(); } }
  function add(e) {
    e.preventDefault();
    const name = newItem.trim(); if (!name) return;
    app.shopping = addToList(app.shopping, [{ name, qty: null, unit: '' }]); saveState(); newItem = '';
  }
  async function share() {
    try { const how = await shareText('Список покупок', listText(app.shopping)); if (how === 'copied') toast('Список скопирован в буфер обмена'); }
    catch (e) { if (!/cancel|abort/i.test(String(e && (e.message || e.name)))) toast('Не удалось поделиться списком'); }
  }
  const qtyText = x => (x.qty === null && (x.unit === 'по вкусу' || !x.unit) ? '' : fmtQty(x.qty, x.unit));
</script>

<h1 class="screen-title">Список покупок</h1>
<p class="sub">{app.shopping.length ? `${todo.length} из ${app.shopping.length} осталось купить` : 'Добавляйте ингредиенты из рецептов кнопкой «В список покупок»'}</p>

<form class="shop-add" onsubmit={add}>
  <input class="search-box" bind:value={newItem} placeholder="Добавить продукт вручную" aria-label="Добавить продукт вручную" maxlength="120">
  <button class="btn" type="submit" aria-label="Добавить"><Icon name="plus" size={18} /></button>
</form>

{#if app.shopping.length}
  <ul class="shop-list">
    {#each [...todo, ...done] as x (x.key)}
      <li class:done={x.done}>
        <label><input type="checkbox" checked={x.done} onchange={() => toggle(x)}><span class="shop-name">{x.name}</span><span class="shop-qty">{qtyText(x)}</span></label>
        <button class="icon-btn sm ghost" onclick={() => remove(x)} aria-label="Удалить {x.name}"><Icon name="trash" size={16} /></button>
      </li>
    {/each}
  </ul>
  <div class="shop-actions">
    <button class="btn" onclick={share}>Поделиться списком</button>
    {#if done.length}<button class="btn outline" onclick={clearDone}>Убрать купленное</button>{/if}
    <button class="btn outline" onclick={clearAll}>Очистить</button>
  </div>
  {#if dishes.length}
    <div class="ref-more" style="margin-top:12px">Из рецептов:
      {#each dishes as d, i (d.id)}<button class="link" onclick={() => navigate(dishScreen(d.id), d.id)}>{d.title.split(':')[0]}</button>{i < dishes.length - 1 ? ' · ' : ''}{/each}
    </div>
  {/if}
{:else}
  <div class="card empty-shop">
    <p>Список пуст. Откройте рецепт в разделе «Популярные блюда», выберите число порций и нажмите «В список покупок».</p>
    <button class="btn outline" onclick={() => navigate('catalog', 'I')}>К блюдам</button>
  </div>
{/if}
