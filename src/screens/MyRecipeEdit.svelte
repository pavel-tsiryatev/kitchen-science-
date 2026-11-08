<script>
  /** Новый или изменяемый свой рецепт: название, порции, ингредиенты строками, шаги строками */
  import { state as app, saveState } from '../store.svelte.js';
  import { navigate } from '../router.js';
  import { toast } from '../toast.js';
  import { parseIngredientLine, ingredientLine, parseStepsText, newRecipeId, sanitizeMyRecipes, photosSize, PHOTOS_TOTAL_MAX, okPhoto } from '../myRecipes.js';
  import { shrinkPhoto } from '../photo.js';
  import { fmtQty } from '../ingredients.js';
  import { perServing } from '../nutrition.js';

  const editing = app.myRecipes.find(r => r.id === app.editRecipeId) || null;
  let title = $state(editing?.title || '');
  let servings = $state(editing?.servings || 2);
  let ingrText = $state(editing ? editing.items.map(ingredientLine).join('\n') : '');
  let stepsText = $state(editing ? editing.steps.join('\n') : '');
  let tried = $state(false);
  let photo = $state(editing?.photo || null), busy = $state(false);

  async function pickPhoto(e) {
    const f = e.currentTarget.files?.[0]; e.currentTarget.value = '';
    if (!f) return;
    busy = true;
    try {
      const p = await shrinkPhoto(f);
      const others = photosSize(app.myRecipes.filter(r => r.id !== editing?.id));
      if (!okPhoto(p)) toast('Не удалось обработать фото');
      else if (others + p.length > PHOTOS_TOTAL_MAX) toast('Слишком много фото: удалите фото у других рецептов');
      else photo = p;
    } catch (err) { toast('Не удалось открыть фото'); }
    busy = false;
  }

  const items = $derived(ingrText.split('\n').map(parseIngredientLine).filter(Boolean).slice(0, 60));
  const steps = $derived(parseStepsText(stepsText));
  const nutr = $derived(items.length ? perServing({ servings, items }) : null);
  const titleOk = $derived(title.trim().length > 0);

  function save() {
    tried = true;
    if (!titleOk) { toast('Введите название рецепта'); return; }
    const id = editing?.id || newRecipeId();
    const [r] = sanitizeMyRecipes([{ id, title, servings: Math.round(servings) || 2, items, steps, photo }]);
    app.myRecipes = editing ? app.myRecipes.map(x => (x.id === id ? r : x)) : [r, ...app.myRecipes];
    saveState();
    toast(editing ? 'Рецепт сохранён' : 'Рецепт добавлен');
    if (editing) history.back(); else navigate('myrecipe', id);
  }
</script>

<h1 class="screen-title">{editing ? 'Изменить рецепт' : 'Новый рецепт'}</h1>
<p class="sub">Для своего рецепта работают пересчёт порций, список покупок, меню, режим «Готовлю» и таймеры.</p>

<section class="card my-edit">
  <label class="fl">Название
    <input class="field" bind:value={title} maxlength="120" placeholder="Например: Бабушкин борщ" aria-invalid={tried && !titleOk}>
  </label>
  {#if tried && !titleOk}<p class="my-err">Без названия рецепт не сохранить.</p>{/if}

  <div class="fl">На сколько порций
    <div class="ingr-serv" role="group" aria-label="Число порций">
      <button class="icon-btn sm" onclick={() => servings = Math.max(1, servings - 1)} disabled={servings <= 1} aria-label="Меньше порций">−</button>
      <span><b>{servings}</b></span>
      <button class="icon-btn sm" onclick={() => servings = Math.min(50, servings + 1)} disabled={servings >= 50} aria-label="Больше порций">+</button>
    </div>
  </div>

  <div class="fl">Фото блюда
    {#if photo}
      <img class="my-photo" src={photo} alt="Фото блюда">
      <div class="my-photo-actions">
        <label class="btn outline sm">Заменить<input type="file" accept="image/*" onchange={pickPhoto} hidden></label>
        <button class="btn outline sm" onclick={() => photo = null}>Убрать фото</button>
      </div>
    {:else}
      <label class="btn outline sm my-photo-add">{busy ? 'Обработка…' : '+ Добавить фото'}<input type="file" accept="image/*" onchange={pickPhoto} hidden aria-label="Фото блюда"></label>
    {/if}
  </div>

  <label class="fl">Ингредиенты — по одному в строке
    <textarea class="field" rows="7" bind:value={ingrText} placeholder={'Мука — 200 г\n2 яйца\n1,5 стакана молока\nСоль по вкусу'}></textarea>
  </label>
  {#if items.length}
    <ul class="ingr-list my-preview" aria-label="Как приложение поняло ингредиенты">
      {#each items as it, k (k)}<li><span>{it.name}</span><b>{it.qty === null ? it.unit : fmtQty(it.qty, it.unit)}</b></li>{/each}
    </ul>
    <p class="ingr-note">Проверьте, правильно ли поняты количества. Понятные единицы: г, кг, мл, л, шт, ст. л., ч. л., стакан, зубчик, пучок, банка.{#if nutr}{" "}Примерно {nutr.kcal} ккал на порцию.{/if}</p>
  {/if}

  <label class="fl">Шаги — каждый с новой строки
    <textarea class="field" rows="7" bind:value={stepsText} placeholder={'Нарежьте лук.\nОбжарьте 5 минут.\nДобавьте остальное и варите 20 минут.'}></textarea>
  </label>
  {#if steps.length}<p class="ingr-note">Шагов: {steps.length}. Время в шаге («20 минут») станет кнопкой таймера в режиме «Готовлю».</p>{/if}
</section>

<div class="shop-actions">
  <button class="btn" onclick={save}>Сохранить</button>
  <button class="btn outline" onclick={() => history.back()}>Отмена</button>
</div>
