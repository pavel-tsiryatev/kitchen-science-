import { TROUBLESHOOTING, COMPARISONS } from '../data/index.js';
import { state, saveState } from '../store.js';
import { render, navigate } from '../router.js';
import { toast } from '../toast.js';
import { escapeHtml, num, fmt, MAXV } from '../utils.js';

// --- ЭКРАН 4: ИНСТРУМЕНТЫ (КАЛЬКУЛЯТОР, ОШИБКИ, СРАВНЕНИЯ) ---
export function renderTools() {
  return `
    ${labBar()}
    ${state.subTab === 'calc' ? renderCalculator() : state.subTab === 'trouble' ? renderTroubleshooting() : renderComparisons()}
  `;
}

export function renderTroubleshooting() {
  return TROUBLESHOOTING.map(t => `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <h3 style="margin:0 0 8px 0;font-size:1.05rem;color:var(--danger);">⚠️ ${escapeHtml(t.title)}</h3>
      </div>
      <div style="font-size:0.88rem;margin-bottom:8px;">
        <strong>Вероятные причины:</strong>
        <ul style="margin:4px 0;padding-left:18px;">
          ${t.causes.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
        </ul>
      </div>
      <div style="font-size:0.88rem;margin-bottom:8px;padding:8px 10px;border-radius:10px;background:var(--surface-alt);">
        <strong>🔍 Диагностика:</strong> ${escapeHtml(t.diag)}
      </div>
      <div style="font-size:0.88rem;padding:8px 10px;border-radius:10px;background:var(--secondary-soft);">
        <strong>✅ Решение:</strong> ${escapeHtml(t.fix)}
      </div>
      <button class="btn outline" style="margin-top:10px;padding:7px 12px;font-size:0.8rem;" onclick="navigate('article','${t.rel}')">
        Открыть научную статью по теме →
      </button>
    </div>
  `).join('');
}

export function renderComparisons() {
  return COMPARISONS.map(c => `
    <div class="card" style="overflow-x:auto;">
      <h3 style="margin:0 0 8px 0;font-size:1.02rem;color:var(--primary);">⚡ ${escapeHtml(c.title)}</h3>
      <table class="comp-table">
        <thead>
          <tr>${c.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${c.rows.map(r => `<tr>${r.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>
  `).join('');
}

export function goSearch() { navigate('catalog'); const i = document.getElementById('catSearchInput'); if (i) i.focus(); }
export function labGo(k) { if (k === 'journal' || k === 'quiz') { state.labTab = k; navigate('lab'); } else { state.subTab = k; navigate('tools'); } }
export function labBar() {
  const cur = state.tab === 'lab' ? state.labTab : state.subTab;
  const items = [['calc', 'Калькулятор'], ['trouble', 'Ошибки'], ['compare', 'Сравнение'], ['journal', 'Журнал'], ['quiz', 'Тесты']];
  return `<h1 class="screen-title">Лаборатория</h1><p class="sub">Расчёты, диагностика и записи экспериментов</p>
    <div class="pill-bar">${items.map(([k, t]) => `<button class="pill ${cur === k ? 'active' : ''}" onclick="labGo('${k}')">${t}</button>`).join('')}</div>`;
}

// --- калькулятор: ввод не перерисовывает экран, фокус не теряется ---
export function calcRatio() { const b = num(state.basePortions), t = num(state.targetPortions); return (b > 0 && t > 0 && b <= MAXV && t <= MAXV) ? t / b : NaN; }
export function okAmt(a) { return a >= 0 && a <= MAXV; }
export function refreshCalc() {
  const set = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
  if (state.calcMode === 'portions') {
    const r = calcRatio();
    set('calcRatio', Number.isFinite(r) ? '×' + fmt(r, 2) : '×—');
    state.recipeItems.forEach((it, i) => { const a = num(it.amount); set('pr' + i, okAmt(a) && Number.isFinite(r) ? fmt(a * r) + ' ' + it.unit : '—'); });
    set('calcMsg', Number.isFinite(r) ? '' : 'Введите число порций больше 0 (не более 1 000 000).');
  } else {
    const f = num(state.bakerFlour), ok = f > 0 && f <= MAXV; let tot = 100;
    state.bakerItems.forEach((it, i) => { const p = num(it.pct), pv = p >= 0 && p <= 1000; set('bg' + i, ok && pv ? fmt(f * p / 100) + ' г' : '—'); if (pv) tot += p; });
    set('bTotal', ok ? fmt(f * tot / 100) + ' г (' + fmt(tot) + '% от муки)' : '—');
    set('calcMsg', ok ? '' : 'Введите массу муки больше 0 г (не более 1 000 000).');
  }
}
export function calcEdit(kind, i, field, val) {
  if (kind === 'p') state[field] = val;
  else if (kind === 'r') state.recipeItems[i][field] = val;
  else if (kind === 'bf') state.bakerFlour = val;
  else state.bakerItems[i][field] = val;
  saveState(); refreshCalc();
}
export function calcAdd(kind) {
  if (kind === 'r') { if (state.recipeItems.length >= 60) return toast('Не больше 60 строк'); state.recipeItems.push({ name: 'Новый ингредиент', amount: '100', unit: 'г' }); }
  else { if (state.bakerItems.length >= 60) return toast('Не больше 60 строк'); state.bakerItems.push({ name: 'Добавка', pct: '5' }); }
  saveState(); render();
}
export function calcDel(kind, i) {
  (kind === 'r' ? state.recipeItems : state.bakerItems).splice(i, 1);
  saveState(); render();
}
export function renderCalculator() {
  const numIn = (call, v, lbl) => `<input type="number" inputmode="decimal" step="any" min="0" class="field" aria-label="${lbl}" value="${escapeHtml(v)}" oninput="${call}">`;
  const modeBtn = (m, t) => `<button class="btn ${state.calcMode === m ? '' : 'outline'} full" onclick="state.calcMode='${m}';render()">${t}</button>`;
  let body;
  if (state.calcMode === 'portions') {
    body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px;">
        <div><label style="font-size:0.78rem;color:var(--text-muted)">Исходных порций</label>${numIn("calcEdit('p',0,'basePortions',this.value)", state.basePortions, 'Исходных порций')}</div>
        <div><label style="font-size:0.78rem;color:var(--text-muted)">Нужно порций (<span id="calcRatio">×</span>)</label>${numIn("calcEdit('p',0,'targetPortions',this.value)", state.targetPortions, 'Нужно порций')}</div>
      </div>
      <div class="err" id="calcMsg" role="alert"></div>
      <h4 style="margin:0 0 8px 0;">Ингредиенты (исходное → пересчёт)</h4>
      ${state.recipeItems.map((it, i) => `
        <div class="input-row">
          <input class="field" maxlength="80" aria-label="Название ингредиента" value="${escapeHtml(it.name)}" oninput="calcEdit('r',${i},'name',this.value)">
          ${numIn(`calcEdit('r',${i},'amount',this.value)`, it.amount, 'Количество')}
          <select class="field" aria-label="Единица" onchange="calcEdit('r',${i},'unit',this.value)">
            ${['г', 'мл', 'шт'].map(u => `<option value="${u}" ${it.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
          </select>
          <button class="icon-btn" aria-label="Удалить ингредиент" onclick="calcDel('r',${i})">✕</button>
        </div>
        <div class="calc-out" style="font-size:0.82rem;color:var(--secondary);font-weight:700;margin:-4px 0 10px 4px;">→ <strong id="pr${i}"></strong></div>`).join('')}
      <button class="btn outline full" onclick="calcAdd('r')">+ Добавить ингредиент</button>
      <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0;">Пересчёт линейный. Соль, разрыхлитель, специи, размер формы и время выпечки при сильном изменении масштаба меняются не строго пропорционально: время зависит скорее от толщины, чем от массы. Корректируйте по вкусу и готовности.</p>`;
  } else {
    body = `
      <div class="art-block olive" style="margin-bottom:12px;"><h4>Формула пекаря</h4>
        <div style="font-size:0.85rem;">Масса всей муки принимается за <strong>100%</strong>, остальное — в процентах от неё. Закваска и опара считаются отдельной строкой: мука и вода внутри них в общую гидратацию здесь не пересчитываются.</div></div>
      <div style="margin-bottom:6px;"><label style="font-size:0.82rem;font-weight:700;">Масса муки (100%), г:</label>${numIn("calcEdit('bf',0,'',this.value)", state.bakerFlour, 'Масса муки в граммах')}</div>
      <div class="err" id="calcMsg" role="alert"></div>
      ${state.bakerItems.map((it, i) => `
        <div class="input-row">
          <input class="field" maxlength="80" aria-label="Название компонента" value="${escapeHtml(it.name)}" oninput="calcEdit('b',${i},'name',this.value)">
          ${numIn(`calcEdit('b',${i},'pct',this.value)`, it.pct, 'Процент от муки')}
          <div class="calc-out" style="font-weight:800;color:var(--primary);text-align:right;" id="bg${i}"></div>
          <button class="icon-btn" aria-label="Удалить компонент" onclick="calcDel('b',${i})">✕</button>
        </div>`).join('')}
      <button class="btn outline full" style="margin-bottom:10px;" onclick="calcAdd('b')">+ Добавить компонент (%)</button>
      <div class="calc-out" style="padding:12px;border-radius:12px;background:var(--secondary-soft);font-weight:700;">Итоговая масса теста: <span id="bTotal"></span></div>`;
  }
  setTimeout(refreshCalc, 0);
  return `<div class="card"><div style="display:flex;gap:8px;margin-bottom:14px;">${modeBtn('portions', 'Пересчёт порций')}${modeBtn('baker', 'Проценты пекаря')}</div>${body}</div>`;
}
