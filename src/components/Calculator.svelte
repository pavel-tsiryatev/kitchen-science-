<script>
  // Калькулятор: результаты пересчитываются реактивно, поля ввода не пересоздаются
  import { state, saveState } from '../store.svelte.js';
  import { toast } from '../toast.js';
  import { num, fmt, MAXV } from '../utils.js';

  const okAmt = a => a >= 0 && a <= MAXV;
  const ratio = $derived.by(() => {
    const b = num(state.basePortions), t = num(state.targetPortions);
    return (b > 0 && t > 0 && b <= MAXV && t <= MAXV) ? t / b : NaN;
  });
  const flour = $derived(num(state.bakerFlour));
  const flourOk = $derived(flour > 0 && flour <= MAXV);
  const pctOk = p => p >= 0 && p <= 1000;
  const bakerTotal = $derived(state.bakerItems.reduce((t, it) => { const p = num(it.pct); return pctOk(p) ? t + p : t; }, 100));

  function portionOut(it) { const a = num(it.amount); return okAmt(a) && Number.isFinite(ratio) ? fmt(a * ratio) + ' ' + it.unit : '—'; }
  function bakerOut(it) { const p = num(it.pct); return flourOk && pctOk(p) ? fmt(flour * p / 100) + ' г' : '—'; }

  function edit(obj, field, val) { obj[field] = val; saveState(); }
  function add(kind) {
    const list = kind === 'r' ? state.recipeItems : state.bakerItems;
    if (list.length >= 60) return toast('Не больше 60 строк');
    list.push(kind === 'r' ? { name: 'Новый ингредиент', amount: '100', unit: 'г' } : { name: 'Добавка', pct: '5' });
    saveState();
  }
  function del(list, i) { list.splice(i, 1); saveState(); }
</script>

<div class="card"><div style="display:flex;gap:8px;margin-bottom:14px;">
  <button class="btn {state.calcMode === 'portions' ? '' : 'outline'} full" onclick={() => state.calcMode = 'portions'}>Пересчёт порций</button>
  <button class="btn {state.calcMode === 'baker' ? '' : 'outline'} full" onclick={() => state.calcMode = 'baker'}>Проценты пекаря</button>
</div>
{#if state.calcMode === 'portions'}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px;">
    <div><label for="calcBase" style="font-size:0.78rem;color:var(--text-muted)">Исходных порций</label><input id="calcBase" type="number" inputmode="decimal" step="any" min="0" class="field" aria-label="Исходных порций" value={state.basePortions} oninput={e => edit(state, 'basePortions', e.currentTarget.value)}></div>
    <div><label for="calcTarget" style="font-size:0.78rem;color:var(--text-muted)">Нужно порций (<span id="calcRatio">{Number.isFinite(ratio) ? '×' + fmt(ratio, 2) : '×—'}</span>)</label><input id="calcTarget" type="number" inputmode="decimal" step="any" min="0" class="field" aria-label="Нужно порций" value={state.targetPortions} oninput={e => edit(state, 'targetPortions', e.currentTarget.value)}></div>
  </div>
  <div class="err" id="calcMsg" role="alert">{Number.isFinite(ratio) ? '' : 'Введите число порций больше 0 (не более 1 000 000).'}</div>
  <h4 style="margin:0 0 8px 0;">Ингредиенты (исходное → пересчёт)</h4>
  {#each state.recipeItems as it, i}
    <div class="input-row">
      <input class="field" maxlength="80" aria-label="Название ингредиента" value={it.name} oninput={e => edit(it, 'name', e.currentTarget.value)}>
      <input type="number" inputmode="decimal" step="any" min="0" class="field" aria-label="Количество" value={it.amount} oninput={e => edit(it, 'amount', e.currentTarget.value)}>
      <select class="field" aria-label="Единица" value={it.unit} onchange={e => edit(it, 'unit', e.currentTarget.value)}>
        {#each ['г', 'мл', 'шт'] as u}<option value={u}>{u}</option>{/each}
      </select>
      <button class="icon-btn" aria-label="Удалить ингредиент" onclick={() => del(state.recipeItems, i)}>✕</button>
    </div>
    <div class="calc-out" style="font-size:0.82rem;color:var(--secondary);font-weight:700;margin:-4px 0 10px 4px;">→ <strong id="pr{i}">{portionOut(it)}</strong></div>
  {/each}
  <button class="btn outline full" onclick={() => add('r')}>+ Добавить ингредиент</button>
  <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0;">Пересчёт линейный. Соль, разрыхлитель, специи, размер формы и время выпечки при сильном изменении масштаба меняются не строго пропорционально: время зависит скорее от толщины, чем от массы. Корректируйте по вкусу и готовности.</p>
{:else}
  <div class="art-block olive" style="margin-bottom:12px;"><h4>Формула пекаря</h4>
    <div style="font-size:0.85rem;">Масса всей муки принимается за <strong>100%</strong>, остальное — в процентах от неё. Закваска и опара считаются отдельной строкой: мука и вода внутри них в общую гидратацию здесь не пересчитываются.</div></div>
  <div style="margin-bottom:6px;"><label for="calcFlour" style="font-size:0.82rem;font-weight:700;">Масса муки (100%), г:</label><input id="calcFlour" type="number" inputmode="decimal" step="any" min="0" class="field" aria-label="Масса муки в граммах" value={state.bakerFlour} oninput={e => edit(state, 'bakerFlour', e.currentTarget.value)}></div>
  <div class="err" id="calcMsg" role="alert">{flourOk ? '' : 'Введите массу муки больше 0 г (не более 1 000 000).'}</div>
  {#each state.bakerItems as it, i}
    <div class="input-row">
      <input class="field" maxlength="80" aria-label="Название компонента" value={it.name} oninput={e => edit(it, 'name', e.currentTarget.value)}>
      <input type="number" inputmode="decimal" step="any" min="0" class="field" aria-label="Процент от муки" value={it.pct} oninput={e => edit(it, 'pct', e.currentTarget.value)}>
      <div class="calc-out" style="font-weight:800;color:var(--primary);text-align:right;" id="bg{i}">{bakerOut(it)}</div>
      <button class="icon-btn" aria-label="Удалить компонент" onclick={() => del(state.bakerItems, i)}>✕</button>
    </div>
  {/each}
  <button class="btn outline full" style="margin-bottom:10px;" onclick={() => add('b')}>+ Добавить компонент (%)</button>
  <div class="calc-out" style="padding:12px;border-radius:12px;background:var(--secondary-soft);font-weight:700;">Итоговая масса теста: <span id="bTotal">{flourOk ? fmt(flour * bakerTotal / 100) + ' г (' + fmt(bakerTotal) + '% от муки)' : '—'}</span></div>
{/if}
</div>
