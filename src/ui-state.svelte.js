// Состояние интерфейса, которое не сохраняется в данных пользователя
const KEY = 'kuhnya_onboarded';
export const ui = $state({ onboarding: false });

/** Показать знакомство при первом запуске (отметка хранится только на этом устройстве) */
export function initOnboarding() {
  try { ui.onboarding = !localStorage.getItem(KEY); } catch (e) { ui.onboarding = false; }
}
export function finishOnboarding() {
  ui.onboarding = false;
  try { localStorage.setItem(KEY, '1'); } catch (e) {}
}
