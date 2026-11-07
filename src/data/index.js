// Контент приложения. Статьи — Markdown-файлы в content/articles (см. docs/CONTENT.md),
// разделы, ошибки и сравнения — JSON рядом с этим файлом.
import SECTIONS from './sections.json';
import ARTICLES from 'virtual:articles';
import GLOSSARY from 'virtual:glossary';
import TROUBLESHOOTING from './troubleshooting.json';
import COMPARISONS from './comparisons.json';
import DISH_GROUPS from './dish-groups.json';
import TABLES from './tables.json';
import PRODUCTS from './products.json';
import COLLECTIONS from './collections.json';

export { SECTIONS, ARTICLES, TROUBLESHOOTING, COMPARISONS, GLOSSARY, DISH_GROUPS, TABLES, PRODUCTS, COLLECTIONS };

/** Подписи уровней доказательности (совпадают с scripts/content.mjs) */
export const EVIDENCE_LABEL = {
  high: 'Высокий: механизм подтверждён независимыми рецензируемыми работами',
  medium: 'Средний: основное подтверждено, часть деталей зависит от условий',
  low: 'Низкий: практическое правило с ограниченными данными',
  unverified: 'Источники ещё не сверены',
};
