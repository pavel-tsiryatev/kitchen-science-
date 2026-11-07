import { mount } from 'svelte';
import './styles.css';
import App from './App.svelte';
import { loadState, getPendingMsg } from './store.svelte.js';
import { initHistory, handleBack } from './router.js';
import { initBackButton } from './native.js';
import { initOnboarding } from './ui-state.svelte.js';
import { toast } from './toast.js';

async function start() {
  await loadState(); // на Android данные читаются из Preferences асинхронно
  initHistory();
  initBackButton(handleBack);
  initOnboarding();
  // Шапка, экран и нижнее меню вставляются перед контейнером уведомлений
  mount(App, { target: document.body, anchor: document.getElementById('toast') });
  if (getPendingMsg()) toast(getPendingMsg());
}
start();
