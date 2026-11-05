<script>
  // Журнал: черновик не теряется, есть редактирование и подтверждение удаления
  import { tick } from 'svelte';
  import { state, saveState } from '../store.svelte.js';
  import { toast } from '../toast.js';
  import Icon from './Icon.svelte';

  const EMPTY = () => ({ dish: '', ing: '', temp: '', res: '', next: '' });
  const FIELDS = [
    ['ing', 'Ингредиенты и точные пропорции (граммы, % соли, гидратация)'],
    ['temp', 'Температура и время (внутри куска, духовка, расстойка)'],
    ['res', 'Что получилось (текстура, корочка, сочность, ошибки)'],
    ['next', 'Что изменить в следующий раз (гипотеза)'],
  ];
  const DISH_PH = 'Что готовили (например: Стейк рибай / Хлеб на закваске)';
  const editing = $derived(state.jEditId !== null);

  function save() {
    const d = state.jDraft, dish = d.dish.trim();
    if (!dish) { toast('Укажите название блюда или эксперимента'); document.getElementById('jDish')?.focus(); return; }
    const v = k => d[k].trim() || '—', fields = { dish, ing: v('ing'), temp: v('temp'), result: v('res'), next: v('next') };
    const wasEditing = editing;
    if (wasEditing) { const it = state.journal.find(x => x.id === state.jEditId); if (it) Object.assign(it, fields); }
    else state.journal.unshift({ id: Date.now(), date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }), ...fields });
    state.jDraft = EMPTY(); state.jEditId = null;
    toast(saveState() ? (wasEditing ? 'Запись обновлена' : 'Запись сохранена') : 'Запись добавлена, но не сохранена на устройстве');
  }
  function edit(id) {
    const it = state.journal.find(x => x.id === id); if (!it) return;
    const c = x => x === '—' ? '' : x;
    state.jDraft = { dish: it.dish, ing: c(it.ing), temp: c(it.temp), res: c(it.result), next: c(it.next) }; state.jEditId = id;
    tick().then(() => window.scrollTo(0, 0));
  }
  function cancel() { state.jDraft = EMPTY(); state.jEditId = null; }
  function remove(id) {
    if (!confirm('Удалить эту запись журнала? Действие нельзя отменить.')) return;
    state.journal = state.journal.filter(x => x.id !== id);
    if (state.jEditId === id) { state.jEditId = null; state.jDraft = EMPTY(); }
    toast(saveState() ? 'Запись удалена' : 'Удалено, но не сохранено на устройстве');
  }
</script>

<div class="card">
  <h3 style="margin:0 0 10px 0;font-size:1.05rem;">{editing ? 'Редактирование записи' : '➕ Новая запись в журнал экспериментов'}</h3>
  <div style="display:flex;flex-direction:column;gap:8px;">
    <input id="jDish" class="field" maxlength="200" aria-label={DISH_PH} placeholder={DISH_PH} bind:value={state.jDraft.dish}>
    {#each FIELDS as [k, ph]}
      <textarea class="field" rows="2" maxlength="2000" aria-label={ph} placeholder={ph} bind:value={state.jDraft[k]}></textarea>
    {/each}
    <button class="btn full" onclick={save}>{editing ? 'Сохранить изменения' : 'Сохранить эксперимент на устройстве'}</button>
    {#if editing}<button class="btn outline full" onclick={cancel}>Отмена</button>{/if}
  </div>
</div>
{#if !state.journal.length}
  <div class="card" style="text-align:center;color:var(--text-muted)">Записей пока нет. Добавьте первый эксперимент выше.</div>
{/if}
{#each state.journal as item (item.id)}
  <div class="card note">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px;">
      <span class="tag olive">{item.date}</span>
      <span><button class="icon-btn" aria-label="Редактировать запись" onclick={() => edit(item.id)}><Icon name="pencil" size={20} /></button>
      <button class="icon-btn" aria-label="Удалить запись" onclick={() => remove(item.id)}><Icon name="trash" size={20} /></button></span>
    </div>
    <h4 style="margin:0 0 6px 0;font-size:1.02rem;overflow-wrap:anywhere;">{item.dish}</h4>
    <div style="font-size:0.86rem;margin-bottom:4px;overflow-wrap:anywhere;"><strong>Пропорции:</strong> {item.ing}</div>
    <div style="font-size:0.86rem;margin-bottom:4px;overflow-wrap:anywhere;"><strong>Режим:</strong> {item.temp}</div>
    <div style="font-size:0.86rem;margin-bottom:4px;overflow-wrap:anywhere;"><strong>Результат:</strong> {item.result}</div>
    <div style="font-size:0.86rem;padding:8px;border-radius:8px;background:var(--primary-soft);overflow-wrap:anywhere;"><strong>На следующий раз:</strong> {item.next}</div>
  </div>
{/each}
