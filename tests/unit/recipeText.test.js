// Текст рецепта для «Поделиться»
import { describe, it, expect } from 'vitest';
import { recipeText } from '../../src/recipeText.js';
import { ARTICLES } from '../../src/data/index.js';

const byId = id => ARTICLES.find(a => a.id === id);

describe('текст рецепта', () => {
  it('блюдо: ингредиенты, шаги по порядку, подпись', () => {
    const t = recipeText(byId('i1'));
    expect(t.split('\n')[0]).toBe(byId('i1').title);
    expect(t).toContain('Ингредиенты (2 порции):');
    expect(t).toContain('• Картофель — 600–700 г');
    expect(t).toContain('• Соль — по вкусу');
    expect(t).toMatch(/Как готовить:[\s\S]*\n1\. 600–700 г картофеля[\s\S]*\n7\. Готовую картошку/);
    expect(t.trim().endsWith('— из справочника «Кухня. Наука вкуса»')).toBe(true);
  });
  it('пересчёт на другое число порций с пометкой про шаги', () => {
    const t = recipeText(byId('i1'), 4);
    expect(t).toContain('Ингредиенты (4 порции):');
    expect(t).toContain('• Картофель — 1,2–1,4 кг');
    expect(t).toContain('Количества в шагах — на 2 порции, в списке ингредиентов — на 4.');
  });
  it('рецепт из нескольких частей — с заголовками частей', () => {
    const t = recipeText(byId('i52'));
    expect(t).toMatch(/\nКрем:\n1\. Смешайте 4 желтка/);
  });
  it('статья без рецепта: краткий ответ и вывод', () => {
    const a = byId('c1');
    const t = recipeText(a);
    expect(t).toContain(a.idea);
    expect(t).toContain('Коротко: ' + a.summary);
    expect(t).not.toContain('Ингредиенты');
  });
});
