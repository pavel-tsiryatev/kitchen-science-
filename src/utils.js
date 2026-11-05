// Общие утилиты: экранирование, числа, иконки, оценка времени чтения
export const MAXV = 1e6;
export function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

export function normQ(s) { return String(s || '').trim().toLowerCase().replace(/ё/g, 'е'); }

export function num(v) { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : NaN; }
export function fmt(n, d = 1) { return Number.isFinite(n) ? n.toLocaleString('ru-RU', { maximumFractionDigits: d }) : '—'; }

export function ic(n, s) { return `<svg class="ic" ${s ? `style="width:${s}px;height:${s}px"` : ''} aria-hidden="true"><use href="#i-${n}"/></svg>`; }
export function stripEmoji(h) { return h.replace(/[\u2600\u2696\u26A0\u270F\uFE0F\u{1F300}-\u{1FAFF}]\s?/gu, ''); }
export function readMin(a) { const w = [a.what, a.why, a.factors, a.practice, a.mistakes, a.experiment, a.summary].join(' ').split(/\s+/).length; return Math.max(1, Math.round(w / 170)); }

export function tileOf(sec) { return sec === 'E' ? 't-chem' : sec === 'G' ? 't-phys' : sec === 'H' ? 't-exp' : 't-tech'; }
