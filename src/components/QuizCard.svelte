<script>
  /** Варианты ответа на вопрос статьи и разбор после ответа */
  import { state } from '../store.svelte.js';
  import { qOrder, answerArticleQuiz, retryQuiz } from '../quiz.js';

  let { article: a, label = 'Разбор:', boxStyle } = $props();
  const ans = $derived(state.quizScores[a.id]);
  const order = $derived(qOrder(a));

  function cls(idx) {
    if (ans === undefined) return 'quiz-opt';
    if (idx === a.quiz.a) return 'quiz-opt correct';
    if (idx === ans) return 'quiz-opt wrong';
    return 'quiz-opt';
  }
</script>

{#each order as idx}
  <button class={cls(idx)} onclick={() => answerArticleQuiz(a.id, idx)}>{a.quiz.opts[idx]}</button>
{/each}
{#if ans !== undefined}
  <div style={boxStyle}>
    <strong>{label}</strong> {a.quiz.exp}
    <div style="margin-top:8px"><button class="btn outline" style="padding:6px 12px" onclick={() => retryQuiz(a.id)}>Ответить заново</button></div>
  </div>
{/if}
