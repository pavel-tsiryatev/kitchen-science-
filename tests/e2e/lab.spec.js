import { test, expect } from '@playwright/test';
import { open, lab, pill, btn, toast, saved } from './helpers.js';

test.beforeEach(({ page }) => open(page));

test.describe('калькулятор порций', () => {
  test.beforeEach(({ page }) => lab(page, 'Калькулятор'));

  test('пересчитывает ингредиенты', async ({ page }) => {
    await expect(page.locator('#calcRatio')).toHaveText('×1,5');
    await expect(page.locator('#pr0')).toHaveText('600 г'); // 400 г муки × 6/4
    await page.fill('input[aria-label="Нужно порций"]', '2');
    await expect(page.locator('#calcRatio')).toHaveText('×0,5');
    await expect(page.locator('#pr1')).toHaveText('125 мл'); // молоко 250 мл
  });

  test('некорректное число порций — сообщение и прочерки', async ({ page }) => {
    await page.fill('input[aria-label="Исходных порций"]', '0');
    await expect(page.locator('#calcMsg')).toContainText('больше 0');
    await expect(page.locator('#pr0')).toHaveText('—');
  });

  test('ввод не теряет фокус, строки добавляются и удаляются, всё сохраняется', async ({ page }) => {
    const input = page.locator('input[aria-label="Количество"]').first();
    await input.click(); await input.fill(''); await page.keyboard.type('1000');
    await expect(input).toBeFocused();
    await expect(page.locator('#pr0')).toHaveText('1 500 г');

    await btn(page, '+ Добавить ингредиент').click();
    await expect(page.locator('input[aria-label="Название ингредиента"]')).toHaveCount(6);
    await page.locator('button[aria-label="Удалить ингредиент"]').first().click();
    await expect(page.locator('input[aria-label="Название ингредиента"]').first()).toHaveValue('Молоко 3.2%');

    await page.reload();
    await lab(page, 'Калькулятор');
    await expect(page.locator('input[aria-label="Название ингредиента"]')).toHaveCount(5);
  });
});

test('проценты пекаря', async ({ page }) => {
  await lab(page, 'Калькулятор');
  await btn(page, 'Проценты пекаря').click();
  await expect(page.locator('#bg0')).toHaveText('350 г'); // 70% от 500 г
  await expect(page.locator('#bTotal')).toHaveText('975 г (195% от муки)');
  await page.fill('input[aria-label="Масса муки в граммах"]', '1000');
  await expect(page.locator('#bg0')).toHaveText('700 г');
  await page.fill('input[aria-label="Масса муки в граммах"]', '-5');
  await expect(page.locator('#calcMsg')).toContainText('массу муки');
});

test('справочник ошибок ведёт в статью, сравнения показывают таблицы', async ({ page }) => {
  await lab(page, 'Ошибки');
  await expect(page.locator('.card')).toHaveCount(9);
  await page.getByText('Открыть научную статью по теме →').first().click();
  await expect(page.locator('.art-head h2')).toHaveText('Дрожжевое брожение и симбиоз закваски');
  await page.goBack();
  await expect(page.locator('.pill.active')).toHaveText('Ошибки');
  await pill(page, 'Сравнение');
  await expect(page.locator('table.comp-table')).toHaveCount(6);
});

test('тесты: счёт верных ответов', async ({ page }) => {
  await lab(page, 'Тесты');
  const first = page.locator('.card').nth(1);
  await first.locator('.quiz-opt', { hasText: 'Глютенин' }).click();
  await page.locator('.card').nth(2).locator('.quiz-opt').first().click();
  await expect(page.locator('.card').first()).toContainText(/Ваш результат: \d верных из 2 пройденных/);
  expect(Object.keys((await saved(page)).quizScores)).toHaveLength(2);
});

test.describe('журнал экспериментов', () => {
  test.beforeEach(({ page }) => lab(page, 'Журнал'));

  test('без названия не сохраняется', async ({ page }) => {
    await btn(page, 'Сохранить эксперимент на устройстве').click();
    await expect(toast(page)).toHaveText('Укажите название блюда или эксперимента');
    await expect(page.locator('#jDish')).toBeFocused();
  });

  test('добавить, отредактировать, удалить — и всё переживает перезапуск', async ({ page }) => {
    await page.fill('#jDish', 'Чиабатта 80% 🍞');
    await page.getByPlaceholder('Ингредиенты и точные пропорции').fill('мука 500, вода 400');
    await btn(page, 'Сохранить эксперимент на устройстве').click();
    await expect(toast(page)).toHaveText('Запись сохранена');
    const entry = page.locator('.card.note').first();
    await expect(entry.locator('h4')).toHaveText('Чиабатта 80% 🍞'); // эмодзи пользователя не вырезаются
    await expect(entry).toContainText('Режим: —');

    await entry.getByRole('button', { name: 'Редактировать запись' }).click();
    await expect(page.locator('#jDish')).toHaveValue('Чиабатта 80% 🍞');
    await page.fill('#jDish', 'Чиабатта 82%');
    await btn(page, 'Сохранить изменения').click();
    await expect(toast(page)).toHaveText('Запись обновлена');

    await page.reload();
    await lab(page, 'Журнал');
    await expect(page.locator('.card.note h4').first()).toHaveText('Чиабатта 82%');

    await page.locator('.card.note').first().getByRole('button', { name: 'Удалить запись' }).click();
    await expect(toast(page)).toHaveText('Запись удалена');
    await expect(page.locator('.card.note')).toHaveCount(1); // остался образец
  });

  test('черновик не теряется при переходе на другой экран', async ({ page }) => {
    await page.fill('#jDish', 'Недописанная запись');
    await page.locator('.nav-item[data-tab=catalog]').click();
    await lab(page, 'Журнал');
    await expect(page.locator('#jDish')).toHaveValue('Недописанная запись');
  });
});
