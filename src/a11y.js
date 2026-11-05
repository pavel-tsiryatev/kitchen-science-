// Доступность: кликабельные div получают роль кнопки и управление с клавиатуры
export function enhanceA11y(root) {
  if (!root) return;
  root.querySelectorAll('[onclick]').forEach(e => { if (e.tagName !== 'BUTTON' && e.tagName !== 'A') { e.setAttribute('role', 'button'); e.tabIndex = 0; } });
  root.querySelectorAll('input,select,textarea').forEach(e => { if (!e.getAttribute('aria-label')) e.setAttribute('aria-label', e.placeholder || e.title || 'Поле ввода'); });
}
document.addEventListener('keydown', e => {
  const t = e.target;
  if ((e.key === 'Enter' || e.key === ' ') && t && t.getAttribute && t.getAttribute('role') === 'button' && t.tagName !== 'BUTTON') { e.preventDefault(); t.click(); }
});
