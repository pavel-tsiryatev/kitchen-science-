<script>
  import { state } from '../store.svelte.js';
  import { labGo } from '../router.js';

  const ITEMS = [['calc', 'Калькулятор'], ['trouble', 'Ошибки'], ['compare', 'Сравнение'], ['journal', 'Журнал'], ['quiz', 'Тесты']];
  const cur = $derived(state.tab === 'lab' ? state.labTab : state.subTab);
</script>

<h1 class="screen-title">Лаборатория</h1><p class="sub">Расчёты, диагностика и записи экспериментов</p>
<div class="pill-bar">
  {#each ITEMS as [k, t]}<button class="pill" class:active={cur === k} onclick={() => labGo(k)}>{t}</button>{/each}
</div>
