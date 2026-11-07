<script>
  /** Подборка статей: «Быстро», «Для начинающих», «Праздничный стол» … */
  import { ARTICLES, COLLECTIONS } from '../data/index.js';
  import { state as app } from '../store.svelte.js';
  import ArticleCards from '../components/ArticleCards.svelte';

  const c = $derived(COLLECTIONS.find(x => x.id === app.collectionId) || COLLECTIONS[0]);
  const list = $derived(c.ids.map(id => ARTICLES.find(a => a.id === id)).filter(Boolean));
</script>

<h1 class="screen-title">{c.title}</h1><p class="sub">{c.desc}</p>
<ArticleCards {list} />
