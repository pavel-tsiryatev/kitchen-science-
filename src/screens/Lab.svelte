<script>
  import { ARTICLES } from '../data/index.js';
  import { state } from '../store.svelte.js';
  import LabBar from '../components/LabBar.svelte';
  import QuizCard from '../components/QuizCard.svelte';
  import Journal from '../components/Journal.svelte';

  const solvedCount = $derived(Object.keys(state.quizScores).length);
  const correctCount = $derived(Object.entries(state.quizScores).filter(([aid, ans]) => {
    const art = ARTICLES.find(x => x.id === aid);
    return art && art.quiz.a === ans;
  }).length);
</script>

<LabBar />

{#if state.labTab === 'quiz'}
  <div class="card" style="background:var(--secondary-soft);">
    <strong>Ваш результат: {correctCount} верных из {solvedCount} пройденных (всего {ARTICLES.length} вопросов)</strong>
    <div style="font-size:0.84rem;margin-top:4px;">Отвечайте на вопросы ниже, чтобы закрепить химию и физику процессов.</div>
  </div>
  {#each ARTICLES as a, idx (a.id)}
    <div class="card">
      <span class="tag terra">Вопрос №{idx + 1} • {a.title}</span>
      <div style="font-weight:700;margin:6px 0 10px 0;">{a.quiz.q}</div>
      <QuizCard article={a} label="Объяснение:" boxStyle="font-size:0.84rem;padding:8px 10px;background:var(--surface-alt);border-radius:10px;" />
    </div>
  {/each}
{:else}
  <Journal />
{/if}
