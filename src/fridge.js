// «Что приготовить из того, что есть»: какие блюда получатся из выбранных продуктов.
// Соль, сахар, вода, растительное масло и специи считаются всегда имеющимися.

const STAPLES = /^(соль|перец|вода|тёплая вода|холодная вода|сахар|растительное масло|оливковое масло|масло|сода|уксус|лёд|специи|лавровый лист|тмин|зира|паприка|сладкая паприка|мускатный орех|тимьян|розмарин|травы|соус|соевый соус|горчица|начинка|бульон|мясной бульон|вода или бульон)(?![а-яё])/i; // \b не работает с кириллицей

/** Продукты с готовыми регулярными выражениями */
export function compileProducts(products) {
  return products.map(p => ({ ...p, re: new RegExp(p.match, 'i') }));
}

/** Какому продукту соответствует ингредиент рецепта (первое совпадение по порядку списка) */
export function productOf(name, products) {
  const n = name.toLowerCase();
  return products.find(p => p.re.test(n)) || null;
}

/** Обязательные ингредиенты блюда: без «по вкусу», «(по желанию)» и базовых продуктов */
export function required(article) {
  return (article.ingredients?.items || []).filter(it =>
    it.qty !== null && !/по желанию/i.test(it.name) && !STAPLES.test(it.name.replace(/\s*\(.*?\)/g, '').trim()));
}

/**
 * Блюда, для которых есть хотя бы один основной продукт, по возрастанию «чего не хватает».
 * [{ article, have: [названия], missing: [названия] }]
 */
export function suggest(articles, selectedIds, products) {
  const sel = new Set(selectedIds);
  const out = [];
  for (const a of articles) {
    const req = required(a);
    if (!req.length) continue;
    const have = [], missing = [];
    for (const it of req) {
      const p = productOf(it.name, products);
      (p && sel.has(p.id) ? have : missing).push(it.name.replace(/\s*\(.*?\)/g, ''));
    }
    if (have.length) out.push({ article: a, have, missing });
  }
  return out.sort((x, y) => x.missing.length - y.missing.length || y.have.length - x.have.length);
}
