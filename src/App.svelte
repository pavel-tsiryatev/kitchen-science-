<script>
  import { state } from './store.svelte.js';
  import { navigate } from './router.js';
  import Icon from './components/Icon.svelte';
  import Home from './screens/Home.svelte';
  import Catalog from './screens/Catalog.svelte';
  import Article from './screens/Article.svelte';
  import Tools from './screens/Tools.svelte';
  import Lab from './screens/Lab.svelte';
  import Favorites from './screens/Favorites.svelte';
  import Settings from './screens/Settings.svelte';
  import Glossary from './screens/Glossary.svelte';
  import Tables from './screens/Tables.svelte';
  import Shopping from './screens/Shopping.svelte';
  import UpdateBanner from './components/UpdateBanner.svelte';

  const NAV = [
    ['home', 'home', 'Главная'],
    ['catalog', 'book', 'Библиотека'],
    ['tools', 'flask', 'Лаборатория'],
    ['favorites', 'bookmark', 'Сохранённое'],
  ];
  // Статья подсвечивает «Библиотеку», журнал и тесты — «Лабораторию»
  const shopLeft = $derived(state.shopping.filter(x => !x.done).length);
  const activeNav = $derived({ article: 'catalog', glossary: 'catalog', tables: 'catalog', lab: 'tools' }[state.tab] || state.tab);

  function brandKey(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('home'); } }
</script>

<header class="app-bar">
  <div class="brand" role="button" tabindex="0" onclick={() => navigate('home')} onkeydown={brandKey}><svg class="ic mark-ic" style="width:30px;height:30px" aria-hidden="true"><use href="#i-flask" /></svg><div><b>Кухня.</b><span class="s">Наука вкуса</span></div></div>
  <div class="bar-actions">
    <button class="icon-btn cart-btn" onclick={() => navigate('shopping')} title="Список покупок" aria-label="Список покупок{shopLeft ? `, осталось ${shopLeft}` : ''}"><Icon name="cart" />{#if shopLeft}<span class="badge">{shopLeft > 99 ? '99+' : shopLeft}</span>{/if}</button>
    <button class="icon-btn" onclick={() => navigate('settings')} title="Настройки" aria-label="Настройки"><Icon name="sliders" /></button>
  </div>
</header>

<main id="app-Main">
  <UpdateBanner />
  {#if state.tab === 'home'}<Home />
  {:else if state.tab === 'catalog'}<Catalog />
  {:else if state.tab === 'article'}<Article />
  {:else if state.tab === 'tools'}<Tools />
  {:else if state.tab === 'lab'}<Lab />
  {:else if state.tab === 'favorites'}<Favorites />
  {:else if state.tab === 'settings'}<Settings />
  {:else if state.tab === 'glossary'}<Glossary />
  {:else if state.tab === 'tables'}<Tables />
  {:else if state.tab === 'shopping'}<Shopping />
  {/if}
</main>

<nav class="bottom-nav" aria-label="Основная навигация">
  {#each NAV as [tab, icon, label]}
    <button class="nav-item" class:active={activeNav === tab} data-tab={tab} aria-current={activeNav === tab ? 'page' : 'false'} onclick={() => navigate(tab)}><Icon name={icon} /><span>{label}</span></button>
  {/each}
</nav>
