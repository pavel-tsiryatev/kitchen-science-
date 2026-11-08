<script>
  /** Свой рецепт: ингредиенты с пересчётом и кнопками, шаги, заметки, правка и удаление */
  import { state as app, saveState, findDish } from '../store.svelte.js';
  import { navigate } from '../router.js';
  import { toast } from '../toast.js';
  import IngredientsCard from '../components/IngredientsCard.svelte';
  import NotesCard from '../components/NotesCard.svelte';
  import { emptyMenu, DAY_IDS } from '../menu.js';

  const a = $derived(findDish(app.currentArticleId));

  function remove() {
    if (!confirm(`Удалить рецепт «${a.title}»?`)) return;
    const id = a.id;
    app.myRecipes = app.myRecipes.filter(r => r.id !== id);
    // убираем рецепт из меню и заметок; в списке покупок продукты остаются
    const m = { ...emptyMenu(), ...app.menu };
    for (const d of DAY_IDS) m[d] = (m[d] || []).filter(x => x.id !== id);
    app.menu = m;
    const { [id]: _, ...rest } = app.notes; app.notes = rest;
    saveState(); toast('Рецепт удалён'); history.back();
  }
</script>

{#if a}
  <header class="art-head">
    <div class="kicker">Мой рецепт</div>
    <h2>{a.title}</h2>
  </header>

  {#if a.ingredients}
    {#key a}<IngredientsCard article={a} />{/key}
  {:else}
    <p class="ingr-note">Ингредиентов пока нет — добавьте их, чтобы пересчитывать порции и собирать список покупок.</p>
  {/if}

  {#if a.steps.length}
    <section class="card my-steps">
      <h3>Как готовить</h3>
      <ol>{#each a.steps as s (s.n)}<li>{s.text}</li>{/each}</ol>
    </section>
  {/if}

  {#key a.id}<NotesCard id={a.id} />{/key}

  <div class="shop-actions">
    <button class="btn outline" onclick={() => navigate('myedit', a.id)}>Изменить</button>
    <button class="btn outline danger" onclick={remove}>Удалить</button>
  </div>
{:else}
  <div class="card" style="text-align:center;padding:24px;">
    <p>Рецепт не найден: возможно, он удалён.</p>
    <button class="btn" onclick={() => navigate('favorites')}>К моим рецептам</button>
  </div>
{/if}
