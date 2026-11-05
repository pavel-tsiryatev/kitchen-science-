import { state, saveState } from './store.svelte.js';

// Порядок вариантов (детерминированный по id) и ответы на вопросы
export function qOrder(a) {
  let h = 0; for (const c of a.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const p = a.quiz.opts.map((_, i) => i);
  for (let i = p.length - 1; i > 0; i--) { h = (h * 1664525 + 1013904223) >>> 0; const j = h % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  if (p.length > 1 && p[0] === a.quiz.a) [p[0], p[p.length - 1]] = [p[p.length - 1], p[0]];
  return p;
}
export function answerArticleQuiz(id, i) {
  if (state.quizScores[id] !== undefined) return;
  state.quizScores[id] = i;
  if (!state.readIds.includes(id)) state.readIds.push(id);
  saveState();
}
export function retryQuiz(id) { delete state.quizScores[id]; saveState(); }
