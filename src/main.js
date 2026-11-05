import { mount } from 'svelte';
import './styles.css';
import App from './App.svelte';
import { loadState, getPendingMsg } from './store.svelte.js';
import { initHistory } from './router.js';
import { toast } from './toast.js';

loadState();
initHistory();
// Шапка, экран и нижнее меню вставляются перед контейнером уведомлений
mount(App, { target: document.body, anchor: document.getElementById('toast') });
if (getPendingMsg()) toast(getPendingMsg());
