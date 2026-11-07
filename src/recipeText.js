// Текст статьи для «Поделиться»: у блюд — ингредиенты на выбранное число порций и шаги,
// у остальных статей — краткий ответ и вывод.
import { scaleIngredients, fmtQty } from './ingredients.js';
import { parseSteps } from './steps.js';

const porc = n => (n % 10 === 1 && n % 100 !== 11 ? 'порция' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'порции' : 'порций');

export function recipeText(a, servings) {
  const out = [a.title, ''];
  if (a.ingredients) {
    const n = servings || a.ingredients.servings;
    out.push(`Ингредиенты (${n} ${porc(n)}${a.ingredients.title ? ', ' + a.ingredients.title : ''}):`);
    for (const it of scaleIngredients(a.ingredients, n)) out.push(`• ${it.name}${it.qty === null && it.unit === 'по вкусу' ? ' — по вкусу' : ' — ' + fmtQty(it.qty, it.unit)}`);
    out.push('');
    out.push('Как готовить:');
    let section = '';
    for (const s of parseSteps(a.practice)) {
      if (s.section && s.section !== section) { section = s.section; out.push('', section + ':'); }
      out.push(s.n ? `${s.n}. ${s.text}` : s.text);
    }
    if (n !== a.ingredients.servings) out.push('', `Количества в шагах — на ${a.ingredients.servings} ${porc(a.ingredients.servings)}, в списке ингредиентов — на ${n}.`);
  } else {
    out.push(a.idea, '', 'Коротко: ' + a.summary);
  }
  out.push('', '— из справочника «Кухня. Наука вкуса»');
  return out.join('\n');
}
