<script>
  /** «Что приготовить из того, что есть»: отмечаете продукты — получаете блюда */
  import { ARTICLES, PRODUCTS } from '../data/index.js';
  import { state as app, saveState } from '../store.svelte.js';
  import { compileProducts, productOf, required, suggest } from '../fridge.js';
  import { navigate } from '../router.js';

  const P = compileProducts(PRODUCTS);
  const DISHES = ARTICLES.filter(a => a.ingredients);
  // чаще встречающиеся в рецептах продукты — первыми
  const freq = Object.fromEntries(P.map(p => [p.id, DISHES.filter(a => required(a).some(it => productOf(it.name, P)?.id === p.id)).length]));
  const chips = P.filter(p => freq[p.id]).sort((a, b) => freq[b.id] - freq[a.id]);
  // сначала самые частые продукты; остальные — по кнопке «Ещё продукты»
  let all = $state(false);
  const shown = $derived(all ? chips : chips.filter((p, k) => k < 16 || app.fridge.includes(p.id)));

  const list = $derived(suggest(DISHES, app.fridge, P));
  const ready = $derived(list.filter(x => !x.missing.length));
  const almost = $derived(list.filter(x => x.missing.length).slice(0, 20));

  function toggle(id) {
    app.fridge = app.fridge.includes(id) ? app.fridge.filter(x => x !== id) : [...app.fridge, id];
    saveState();
  }
  function clear() { app.fridge = []; saveState(); }
</script>

<h1 class="screen-title">Что приготовить</h1>
<p class="sub">Отметьте продукты, которые есть дома. Соль, сахар, масло и специи учитывать не нужно.</p>

<div class="chips" role="group" aria-label="Продукты">
  {#each shown as p (p.id)}
    <button class="pill" class:active={app.fridge.includes(p.id)} aria-pressed={app.fridge.includes(p.id)} onclick={() => toggle(p.id)}>{p.title}</button>
  {/each}
</div>
<div class="fr-links">
  {#if shown.length < chips.length || all}<button class="link" onclick={() => all = !all}>{all ? 'Свернуть' : `Ещё продукты (${chips.length - shown.length})`}</button>{/if}
  {#if app.fridge.length}<button class="link" onclick={clear}>Снять все отметки ({app.fridge.length})</button>{/if}
</div>

{#if !app.fridge.length}
  <div class="card"><p style="margin:0">Начните с того, что точно есть: например, картофель, яйца, лук, мука.</p></div>
{:else}
  <h3 class="fr-h">Можно приготовить ({ready.length})</h3>
  {#if !ready.length}<p class="sub">Пока ни одного блюда целиком — посмотрите ниже, чего не хватает.</p>{/if}
  {#each ready as r (r.article.id)}
    <button class="card fr-card" onclick={() => navigate('article', r.article.id)}>
      <b>{r.article.title.split(':')[0]}</b><span class="fr-ok">Всё есть</span>
    </button>
  {/each}
  {#if almost.length}
    <h3 class="fr-h">Не хватает немногого</h3>
    {#each almost as r (r.article.id)}
      <button class="card fr-card" onclick={() => navigate('article', r.article.id)}>
        <b>{r.article.title.split(':')[0]}</b><span class="fr-miss">Не хватает: {r.missing.join(', ')}</span>
      </button>
    {/each}
  {/if}
{/if}
