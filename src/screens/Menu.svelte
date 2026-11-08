<script>
  /** Меню на неделю: блюда по дням и список покупок на всю неделю одной кнопкой */
  import { state as app, saveState, findDish, allDishes, dishScreen } from '../store.svelte.js';
  import { DAYS, addToMenu, menuCount, menuToShopping, emptyMenu } from '../menu.js';
  import { navigate } from '../router.js';
  import { toast } from '../toast.js';
  import { dayKcal } from '../nutrition.js';

  const find = findDish;

  const DISHES = $derived(allDishes());
  const name = id => (findDish(id)?.title || '').split(':')[0];
  const total = $derived(menuCount(app.menu));
  const dishWord = n => (n % 10 === 1 && n % 100 !== 11 ? 'блюдо' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'блюда' : 'блюд');

  let pickFor = $state(null), q = $state('');
  const found = $derived(DISHES.filter(a => !q.trim() || a.title.toLowerCase().replace(/ё/g, 'е').includes(q.trim().toLowerCase().replace(/ё/g, 'е'))).slice(0, 30));

  function add(day, a) { app.menu = addToMenu(app.menu, day, a.id, a.ingredients.servings); saveState(); pickFor = null; q = ''; }
  function setServ(day, k, d) {
    const x = app.menu[day][k]; x.servings = Math.min(50, Math.max(1, x.servings + d)); saveState();
  }
  function remove(day, k) { app.menu[day] = app.menu[day].filter((_, j) => j !== k); saveState(); }
  function toShopping() {
    const before = app.shopping.length;
    app.shopping = menuToShopping(app.menu, allDishes(), app.shopping); saveState();
    toast(`Список покупок обновлён: ${app.shopping.length - before > 0 ? '+' + (app.shopping.length - before) + ' продуктов' : 'количества добавлены'}`);
    navigate('shopping');
  }
  function clearAll() { if (confirm('Очистить меню на неделю?')) { app.menu = emptyMenu(); saveState(); } }
</script>

<h1 class="screen-title">Меню на неделю</h1>
<p class="sub">{total ? `${total} ${dishWord(total)} в меню. Соберите из них список покупок одной кнопкой.` : 'Добавляйте блюда в дни недели здесь или кнопкой «В меню» в рецепте.'}</p>

{#each DAYS as [d, short, full] (d)}
  {@const dk = dayKcal(app.menu[d], find)}
  <section class="card menu-day">
    <div class="menu-head"><h3>{full}{#if dk.kcal}<small class="menu-kcal">≈ {dk.kcal} ккал на человека{dk.unknown ? " (без учёта блюд, где расчёта нет)" : ""}</small>{/if}</h3><button class="link" onclick={() => { pickFor = pickFor === d ? null : d; q = ''; }}>{pickFor === d ? 'Закрыть' : '+ Блюдо'}</button></div>
    {#each app.menu[d] || [] as x, k (x.id)}
      <div class="menu-item">
        <button class="menu-name" onclick={() => navigate(dishScreen(x.id), x.id)}>{name(x.id)}</button>
        <div class="ingr-serv">
          <button class="icon-btn sm" onclick={() => setServ(d, k, -1)} disabled={x.servings <= 1} aria-label="Меньше порций">−</button>
          <span><b>{x.servings}</b> порц.</span>
          <button class="icon-btn sm" onclick={() => setServ(d, k, 1)} aria-label="Больше порций">+</button>
          <button class="icon-btn sm ghost" onclick={() => remove(d, k)} aria-label="Убрать {name(x.id)} из меню">✕</button>
        </div>
      </div>
    {:else}
      {#if pickFor !== d}<p class="menu-empty">Пока ничего</p>{/if}
    {/each}
    {#if pickFor === d}
      <div class="menu-pick">
        <input class="search-box" bind:value={q} placeholder="Найти блюдо" aria-label="Найти блюдо для меню">
        <div class="menu-pick-list">
          {#each found as a (a.id)}<button class="pill" onclick={() => add(d, a)}>{a.title.split(':')[0]}</button>{/each}
        </div>
      </div>
    {/if}
  </section>
{/each}

{#if total}
  <div class="shop-actions">
    <button class="btn" onclick={toShopping}>Собрать список покупок</button>
    <button class="btn outline" onclick={clearAll}>Очистить меню</button>
  </div>
{/if}
