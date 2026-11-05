// Навигация и кнопка «Назад»: возврат на предыдущий экран, закрытие карточек, выход только с главной
import { describe, it, expect, beforeEach, vi } from 'vitest';

let router, store;
const popped = () => new Promise(r => window.addEventListener('popstate', () => setTimeout(r, 0), { once: true }));

beforeEach(async () => {
  localStorage.clear();
  document.body.innerHTML = '<div id="toast"></div>';
  window.scrollTo = () => {};
  vi.resetModules();
  store = await import('../../src/store.svelte.js');
  router = await import('../../src/router.js');
  router.initHistory();
});

describe('«Назад»', () => {
  it('на главной без истории — выход из приложения', () => {
    expect(store.state.tab).toBe('home');
    expect(router.handleBack()).toBe(false);
  });

  it('возвращает на предыдущий экран, а не закрывает приложение', async () => {
    router.navigate('catalog', 'I');
    router.navigate('article', 'i1');
    expect(store.state.tab).toBe('article');

    let p = popped(); expect(router.handleBack()).toBe(true); await p;
    expect(store.state.tab).toBe('catalog');
    expect(store.state.secFilter).toBe('I');

    p = popped(); expect(router.handleBack()).toBe(true); await p;
    expect(store.state.tab).toBe('home');
    expect(router.handleBack()).toBe(false);
  });

  it('сначала закрывает открытую карточку термина', () => {
    router.navigate('article', 'c1');
    const close = vi.fn();
    const off = router.onBackClose(close);
    expect(router.handleBack()).toBe(true);
    expect(close).toHaveBeenCalledOnce();
    expect(store.state.tab).toBe('article');
    off();
  });

  it('с другого экрана без истории ведёт на главную', () => {
    router.navigate('settings', null, true); // экран открыт без записи в истории
    expect(router.handleBack()).toBe(true);
    expect(store.state.tab).toBe('home');
    expect(router.handleBack()).toBe(false);
  });
});
