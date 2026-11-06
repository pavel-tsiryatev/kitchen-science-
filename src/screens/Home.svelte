<script>
  import { ARTICLES, GLOSSARY } from '../data/index.js';
  import { state } from '../store.svelte.js';
  import { navigate, goSearch, labGo } from '../router.js';
  import { readMin } from '../utils.js';
  import Icon from '../components/Icon.svelte';
  import ArticleCards from '../components/ArticleCards.svelte';

  const total = ARTICLES.length;
  const cover = ARTICLES.find(a => a.id === 'a1') || ARTICLES[0];
  const readCount = $derived(state.readIds.length);
  const pct = $derived(Math.round(readCount / total * 100));
  const nextArt = $derived(ARTICLES.find(a => !state.readIds.includes(a.id)) || ARTICLES[0]);
  const rec = $derived((state.recentIds || []).map(id => ARTICLES.find(a => a.id === id)).filter(Boolean).slice(0, 3));

  const DIRS = [
    ['E', 'Химия вкуса', 'Рецепторы, аромат, баланс', 'atom', 't-chem'],
    ['G', 'Физика приготовления', 'Тепло, влага, посуда', 'therm', 't-phys'],
    ['TECH', 'Кулинарные техники', 'Тесто, десерты, мясо, соусы', 'hat', 't-tech'],
    ['H', 'Эксперименты', 'Проверь теорию сам', 'flask', 't-exp'],
  ];
  const ROWS = [
    ['flask', 'Калькуляторы', 'Порции и проценты пекаря', 'calc'],
    ['warn', 'Диагностика ошибок', 'Что пошло не так?', 'trouble'],
    ['book', 'Журнал экспериментов', 'Результаты и наблюдения', 'journal'],
  ];
  const CRUMB = [[70,150,34,22],[150,120,26,18],[235,160,38,24],[310,125,22,15],[120,195,20,13],[200,205,30,17],[290,200,24,16],[355,170,18,12],[60,100,16,11],[180,85,22,14]];
</script>

<section class="cover" aria-label="Обложка исследования">
  <svg class="crumb" viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="340" fill="#6B4A2B" /><rect y="250" width="400" height="90" fill="#4A321C" />{#each CRUMB as [x, y, rx, ry]}<ellipse cx={x} cy={y} {rx} {ry} fill="#1E1710" opacity=".55" /><ellipse cx={x} cy={y} rx={rx + 4} ry={ry + 4} fill="none" stroke="#C9965F" stroke-width="2" opacity=".5" />{/each}</svg>
  <div class="cover-body"><span class="mark">ИССЛЕДОВАНИЕ № 01</span>
    <h2>Почему хлеб становится воздушным?</h2>
    <p>Дрожжи, газовые пузырьки и структура клейковины — от химии теста до хрустящей корочки.</p>
    <div class="cover-foot"><span><Icon name="clock" size={16} /> {readMin(cover)} мин</span><button class="btn" onclick={() => navigate('article', cover.id)}>Читать <Icon name="chev" size={16} /></button></div></div>
</section>
<button class="searchbar" onclick={goSearch}><Icon name="search" size={20} /><span>Поиск по материалам</span></button>
<div class="eyebrow"><h3>Направления</h3><button class="link" onclick={() => navigate('catalog', 'ALL')}>Все темы</button></div>
<div class="dirs">
  {#each DIRS as [k, t, d, i, c]}
    <button class="dir {c}" onclick={() => navigate('catalog', k)}><Icon name={i} /><b>{t}</b><span>{d}</span></button>
  {/each}
  <button class="dir t-dish wide" onclick={() => navigate('catalog', 'I')}><Icon name="pan" /><b>Популярные блюда</b><span>Сырники, картошка, паста — рецепт и почему он работает</span></button>
  <button class="dir t-skill wide" onclick={() => navigate('catalog', 'J')}><Icon name="therm" /><b>Базовые навыки</b><span>Сковорода, соль, термометр, лук, разморозка</span></button>
</div>
<div class="eyebrow"><h3>Твоя лаборатория</h3></div>
<div class="list">
  {#each ROWS as [i, t, d, k]}
    <button class="row" onclick={() => labGo(k)}><Icon name={i} size={22} /><span><b>{t}</b><small>{d}</small></span><span class="go"><Icon name="chev" size={18} /></span></button>
  {/each}
  <button class="row" onclick={() => navigate('tables')}><Icon name="therm" size={22} /><span><b>Справочные таблицы</b><small>Температуры, сроки хранения, крупы, замены</small></span><span class="go"><Icon name="chev" size={18} /></span></button>
  <button class="row" onclick={() => navigate('glossary')}><Icon name="book" size={22} /><span><b>Глоссарий терминов</b><small>{GLOSSARY.length} понятий простыми словами</small></span><span class="go"><Icon name="chev" size={18} /></span></button>
</div>
<div class="eyebrow"><h3>Продолжить обучение</h3><span class="mono-s">{readCount} из {total}</span></div>
<div class="card"><div class="progress-bar"><div class="progress-fill" style="width:{pct}%"></div></div>
  <div class="ed-t" style="margin-top:8px">{nextArt.title}</div>
  <button class="btn outline" style="margin-top:10px" onclick={() => navigate('article', nextArt.id)}>Открыть статью</button></div>
{#if rec.length}
  <div class="eyebrow"><h3>Недавно открытые</h3></div>
  <ArticleCards list={rec} />
{/if}
