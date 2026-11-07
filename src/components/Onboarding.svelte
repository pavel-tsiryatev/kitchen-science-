<script>
  /** Знакомство при первом запуске: что умеет приложение, 4 экрана */
  import { ARTICLES } from '../data/index.js';
  import { finishOnboarding } from '../ui-state.svelte.js';
  import { onBackClose, navigate } from '../router.js';
  import Icon from './Icon.svelte';

  const dishes = ARTICLES.filter(a => a.sec === 'I').length;
  const SLIDES = [
    { icon: 'flask', title: 'Почему на кухне всё работает так, а не иначе', text: `${ARTICLES.length} статей простым языком: от клейковины и реакции Майяра до безопасного хранения. У каждой — проверенные научные источники.` },
    { icon: 'pan', title: 'Популярные блюда — рецепт и объяснение', text: `${dishes} блюд: пересчёт на нужное число порций, режим «Готовлю» с крупными шагами и таймерами из рецепта.` },
    { icon: 'cart', title: 'Меню на неделю и список покупок', text: 'Раскладывайте блюда по дням — список покупок соберётся сам, одинаковые продукты сложатся.' },
    { icon: 'search', title: 'Что приготовить из того, что есть', text: 'Отметьте продукты дома — и увидите, что можно приготовить. А в «Таблицах» — температуры готовности, сроки хранения, меры и веса.' },
  ];
  let i = $state(0);
  const last = $derived(i === SLIDES.length - 1);
  $effect(() => onBackClose(() => finishOnboarding()));
  function next() { if (last) { finishOnboarding(); navigate('home'); } else i++; }
</script>

<div class="onb" role="dialog" aria-modal="true" aria-labelledby="onb-t">
  <div class="onb-card">
    {#key i}
      <div class="onb-slide step-next">
        <div class="onb-ic"><Icon name={SLIDES[i].icon} size={40} /></div>
        <h2 id="onb-t">{SLIDES[i].title}</h2>
        <p>{SLIDES[i].text}</p>
      </div>
    {/key}
    <div class="cook-dots onb-dots" aria-hidden="true">{#each SLIDES as _, k}<span class:on={k === i}></span>{/each}</div>
    <div class="onb-nav">
      <button class="link" onclick={finishOnboarding}>Пропустить</button>
      <button class="btn" onclick={next}>{last ? 'Начать' : 'Далее'}</button>
    </div>
  </div>
</div>
