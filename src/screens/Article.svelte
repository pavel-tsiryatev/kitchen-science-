<script>
  import { ARTICLES, SECTIONS } from '../data/index.js';
  import { state as app, saveState } from '../store.svelte.js'; // не «state»: имя конфликтует с руной $state
  import { navigate } from '../router.js';
  import { readMin, paragraphs } from '../utils.js';
  import { EVIDENCE_LABEL } from '../data/index.js';
  import Sources from '../components/Sources.svelte';
  import Icon from '../components/Icon.svelte';
  import QuizCard from '../components/QuizCard.svelte';
  import TermSheet from '../components/TermSheet.svelte';
  import IngredientsCard from '../components/IngredientsCard.svelte';
  import NotesCard from '../components/NotesCard.svelte';
  import Figure from '../components/Figure.svelte';
  import { recipeText } from '../recipeText.js';
  import { shareText } from '../native.js';
  import { toast } from '../toast.js';

  async function share() {
    try {
      const how = await shareText(a.title.split(':')[0], recipeText(a, app.servingsFor[a.id]));
      if (how === 'copied') toast(a.ingredients ? 'Рецепт скопирован в буфер обмена' : 'Текст скопирован в буфер обмена');
    } catch (e) { if (!/cancel|abort/i.test(String(e && (e.message || e.name)))) toast('Не удалось поделиться'); }
  }
  import { FIGURES } from '../data/index.js';
  import { GLOSSARY } from '../data/index.js';
  import { compileGlossary, linkTerms } from '../glossary.js';

  const PATTERNS = compileGlossary(GLOSSARY);

  const a = $derived(ARTICLES.find(x => x.id === app.currentArticleId) || ARTICLES[0]);
  const sec = $derived(SECTIONS.find(s => s.id === a.sec));
  const isRead = $derived(app.readIds.includes(a.id));
  const isFav = $derived(app.favIds.includes(a.id));
  const relArts = $derived((a.related || []).map(rid => ARTICLES.find(x => x.id === rid)).filter(Boolean));

  function toggle(list, id) {
    const idx = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1); else list.push(id);
    saveState();
  }
  function relKey(e, id) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('article', id); } }

  // [стиль блока, заголовок, поле]; «Границы применимости» есть не у всех статей
  const BLOCKS = [
    ['', 'Что происходит', 'what'],
    ['', 'Почему это происходит (научный механизм)', 'why'],
    ['olive', 'Что влияет на результат', 'factors'],
    ['olive', 'Как применить на практике', 'practice'],
    ['warn', 'Типичные ошибки и как их избежать', 'mistakes'],
    ['', 'Небольшой домашний эксперимент', 'experiment'],
    ['', 'Границы применимости', 'limitations'],
  ];
  const blocks = $derived(BLOCKS.filter(([, , key]) => a[key]));

  // Первое упоминание каждого термина глоссария в статье становится ссылкой.
  // Считаем сразу для всех блоков по порядку, чтобы «первое» было первым во всей статье.
  const linked = $derived.by(() => {
    const used = new Set(), out = {};
    for (const [, , key] of blocks) out[key] = paragraphs(a[key]).map(p => linkTerms(p, PATTERNS, used));
    return out;
  });
  let openTerm = $state(null);
  $effect(() => { a.id; openTerm = null; }); // при переходе на другую статью карточка закрывается
</script>

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
  <button class="btn outline" style="padding:8px 12px;" onclick={() => navigate('catalog', a.sec)}><Icon name="back" size={20} /><span>{sec.title.split(' ')[0].replace(/,$/, '')}</span></button>
  <div style="display:flex;gap:6px;">
    <button class="btn outline" style="padding:8px 12px;" onclick={share}>
      <Icon name="share" size={20} /><span class="sr">{a.ingredients ? 'Поделиться рецептом' : 'Поделиться'}</span>
    </button>
    <button class="btn {isFav ? '' : 'outline'}" style="padding:8px 12px;" onclick={() => toggle(app.favIds, a.id)}>
      <Icon name="star" size={20} /><span class="sr">{isFav ? 'Убрать из избранного' : 'В избранное'}</span>
    </button>
    <button class="btn {isRead ? 'secondary' : 'outline'}" style="padding:8px 12px;" onclick={() => toggle(app.readIds, a.id)}>
      <Icon name="check" size={20} /><span class="sr">{isRead ? 'Прочитано, снять отметку' : 'Отметить прочитанным'}</span>
    </button>
  </div>
</div>

<header class="art-head"><div class="kicker">{sec.title} · {readMin(a)} мин</div>
  <h2>{a.title}</h2>
  {#if a.evidence !== 'unverified'}
    <div class="evidence ev-{a.evidence}" title={EVIDENCE_LABEL[a.evidence]}><Icon name="check" size={14} />Источники проверены · уровень доказательности: {EVIDENCE_LABEL[a.evidence].split(':')[0].toLowerCase()}</div>
  {/if}
  <div class="lead"><span class="lbl">Краткий ответ</span>{a.idea}</div></header>

{#if a.ingredients}
  {#key a.id}<IngredientsCard article={a} />{/key}
{/if}

{#each blocks as [cls, title, key], i (key)}
  <div class="art-block {cls}">
    <h4>{i + 1}. {title}</h4>
    {#each linked[key] as parts}<p class="art-p">{#each parts as part}{#if part.term}<button class="term" onclick={() => openTerm = part.term}>{part.text}</button>{:else}{part.text}{/if}{/each}</p>{/each}
  </div>
  {#each (a.figures || []).filter(id => FIGURES.find(f => f.id === id)?.after === key) as fid (fid)}<Figure id={fid} />{/each}
{/each}

<div class="art-block Summary">
  <h4>{blocks.length + 1}. Краткий вывод (Запомнить)</h4>
  <div style="font-weight:700;">{a.summary}</div>
</div>

{#key a.id}<NotesCard id={a.id} />{/key}

<Sources article={a} />

<div class="card">
  <h4 style="margin:0 0 8px 0;color:var(--primary);">Проверьте понимание статьи</h4>
  <div style="font-weight:700;margin-bottom:10px;">{a.quiz.q}</div>
  {#key a.id}
    <QuizCard article={a} label="Разбор:" boxStyle="margin-top:8px;padding:10px;border-radius:10px;background:var(--surface-alt);font-size:0.86rem;" />
  {/key}
</div>

<div class="card">
  <h4 style="margin:0 0 8px 0;">Связанные темы</h4>
  {#each relArts as ra (ra.id)}
    <div style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;color:var(--primary);font-weight:600;"
         role="button" tabindex="0" onclick={() => navigate('article', ra.id)} onkeydown={e => relKey(e, ra.id)}>
      → {ra.title}
    </div>
  {/each}
</div>

{#if openTerm}
  <TermSheet id={openTerm} current={a.id} onclose={() => openTerm = null} />
{/if}
