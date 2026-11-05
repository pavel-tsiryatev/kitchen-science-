import './styles.css';
import { state, loadState, saveState, applyThemeAndFont, setTheme, getPendingMsg } from './store.js';
import { render, navigate } from './router.js';
import { toast } from './toast.js';
import { enhanceA11y } from './a11y.js';
import { answerArticleQuiz, retryQuiz } from './quiz.js';
import { renderCatalogListOnly } from './screens/catalog.js';
import { toggleFav, toggleRead } from './screens/article.js';
import { goSearch, labGo, calcEdit, calcAdd, calcDel } from './screens/tools.js';
import { addJournalEntry, editJournalEntry, cancelJournalEdit, deleteJournalEntry } from './screens/lab.js';
import { exportBackup, downloadBackup, importBackup, resetProgress } from './screens/settings.js';

// Шаблоны экранов используют встроенные обработчики (onclick="navigate(...)"),
// поэтому функции, которые они вызывают, публикуются в window.
Object.assign(window, {
  state, render, navigate, saveState, applyThemeAndFont, setTheme,
  answerArticleQuiz, retryQuiz, renderCatalogListOnly, toggleFav, toggleRead,
  goSearch, labGo, calcEdit, calcAdd, calcDel,
  addJournalEntry, editJournalEntry, cancelJournalEdit, deleteJournalEntry,
  exportBackup, downloadBackup, importBackup, resetProgress,
});

loadState();
render();
try { history.replaceState({ tab: 'home', sec: 'ALL', art: null, sub: 'calc' }, ''); } catch (e) {}
enhanceA11y(document.querySelector('header'));
if (getPendingMsg()) toast(getPendingMsg());
