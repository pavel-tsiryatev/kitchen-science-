<script>
  /** Режим «Готовлю»: шаги крупно по одному, свайп, таймеры из шагов, экран не гаснет */
  import { onMount, onDestroy } from 'svelte';
  import { ARTICLES } from '../data/index.js';
  import { state as app } from '../store.svelte.js';
  import { parseSteps, findTimers } from '../steps.js';
  import { scaleIngredients, fmtQty } from '../ingredients.js';
  import { startTimer } from '../timers.svelte.js';
  import { toast } from '../toast.js';
  import NotesCard from '../components/NotesCard.svelte';

  const a = $derived(ARTICLES.find(x => x.id === app.currentArticleId) || ARTICLES[0]);
  const name = $derived(a.title.split(':')[0]);
  const steps = $derived(parseSteps(a.practice));
  const servings = $derived(a.ingredients ? app.servingsFor[a.id] || a.ingredients.servings : 0);
  const items = $derived(a.ingredients ? scaleIngredients(a.ingredients, servings) : []);
  // страницы: [ингредиенты] + шаги + «Готово»
  const pages = $derived([...(items.length ? [{ kind: 'ingr' }] : []), ...steps.map(s => ({ kind: 'step', ...s })), { kind: 'end' }]);
  let i = $state(0);
  const page = $derived(pages[Math.min(i, pages.length - 1)]);

  function go(d) { i = Math.min(pages.length - 1, Math.max(0, i + d)); }
  function key(e) { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }
  let x0 = null;
  const ts = e => { x0 = e.changedTouches[0].clientX; };
  const te = e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); };

  function timer(t) { startTimer({ title: name, label: t.label, seconds: t.seconds, articleId: a.id }); toast(`Таймер на ${t.label} запущен`); }

  // экран не гаснет, пока открыт режим «Готовлю»
  let lock = null, awake = $state(false);
  async function keepAwake() {
    try { if (navigator.wakeLock && document.visibilityState === 'visible') { lock = await navigator.wakeLock.request('screen'); awake = true; lock.addEventListener('release', () => { awake = false; }); } } catch (e) { awake = false; }
  }
  const vis = () => { if (document.visibilityState === 'visible' && !awake) keepAwake(); };
  onMount(() => { keepAwake(); document.addEventListener('visibilitychange', vis); });
  onDestroy(() => { document.removeEventListener('visibilitychange', vis); try { lock && lock.release(); } catch (e) {} });
</script>

<svelte:window onkeydown={key} />

<div class="cook" ontouchstart={ts} ontouchend={te}>
  <div class="cook-top">
    <button class="btn outline" onclick={() => history.back()}>✕ Закрыть</button>
    <span class="cook-awake">{awake ? 'Экран не погаснет' : ''}</span>
  </div>
  <h1 class="cook-title">{name}</h1>
  <div class="cook-dots" aria-hidden="true">{#each pages as _, k}<span class:on={k === i}></span>{/each}</div>

  <section class="cook-page" aria-live="polite">
    {#if page.kind === 'ingr'}
      <div class="cook-kicker">Ингредиенты · {servings} порц.</div>
      <ul class="ingr-list cook-ingr">{#each items as it (it.name)}<li><span>{it.name}</span><b>{fmtQty(it.qty, it.unit)}</b></li>{/each}</ul>
      {#if servings !== a.ingredients.servings}<p class="ingr-note">Количества в шагах указаны на {a.ingredients.servings} порц. — берите количества из этого списка.</p>{/if}
    {:else if page.kind === 'step'}
      <div class="cook-kicker">{page.section ? page.section + ' · ' : ''}{page.n ? `Шаг ${page.n}` : 'Важно'}</div>
      <p class="cook-text">{page.text}</p>
      {#each findTimers(page.text) as t (t.seconds)}
        <button class="btn cook-timer" onclick={() => timer(t)}>⏱ Таймер {t.label}</button>
      {/each}
    {:else}
      <div class="cook-kicker">Готово</div>
      <p class="cook-text">Приятного аппетита! Запишите, что получилось и что изменить в следующий раз.</p>
      {#key a.id}<NotesCard id={a.id} open />{/key}
    {/if}
  </section>

  <div class="cook-nav">
    <button class="btn outline" onclick={() => go(-1)} disabled={i === 0}>← Назад</button>
    <span class="cook-count">{i + 1} / {pages.length}</span>
    <button class="btn" onclick={() => go(1)} disabled={i >= pages.length - 1}>Далее →</button>
  </div>
</div>
