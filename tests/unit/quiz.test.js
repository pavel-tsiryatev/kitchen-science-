import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ARTICLES } from '../../src/data/index.js';

let quiz, store;
beforeEach(async () => {
  localStorage.clear(); vi.resetModules();
  store = await import('../../src/store.svelte.js');
  quiz = await import('../../src/quiz.js');
});

describe('qOrder', () => {
  it.each(ARTICLES.map(a => [a.id, a]))('%s: перестановка всех вариантов, верный ответ не первый', (id, a) => {
    const order = quiz.qOrder(a);
    expect([...order].sort()).toEqual(a.quiz.opts.map((_, i) => i));
    expect(order[0]).not.toBe(a.quiz.a);
    expect(quiz.qOrder(a)).toEqual(order); // детерминированно
  });
});

describe('ответы', () => {
  it('ответ сохраняется один раз и отмечает статью прочитанной', () => {
    quiz.answerArticleQuiz('a1', 2);
    quiz.answerArticleQuiz('a1', 0); // повторный клик игнорируется
    expect(store.state.quizScores.a1).toBe(2);
    expect(store.state.readIds).toEqual(['a1']);
    expect(JSON.parse(localStorage.getItem(store.STORAGE_KEY)).quizScores).toEqual({ a1: 2 });
  });
  it('«Ответить заново» снимает ответ', () => {
    quiz.answerArticleQuiz('a1', 1); quiz.retryQuiz('a1');
    expect(store.state.quizScores.a1).toBeUndefined();
  });
});
