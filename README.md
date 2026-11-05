# Кухня: наука вкуса

Офлайн-справочник по кулинарной науке: статьи, диагностика ошибок, калькуляторы и журнал экспериментов. Android-приложение собирается через Capacitor.

## Разработка

```bash
npm install
npm run dev       # локальный сервер с горячей перезагрузкой
npm run build     # сборка в dist/
npm run preview   # просмотр собранной версии
npm run android   # сборка + синхронизация с Android-проектом (нужен `npx cap add android`)
```

## Структура

Интерфейс написан на [Svelte 5](https://svelte.dev) (руны `$state` / `$derived`), сборка — Vite.

```
index.html                  оболочка: SVG-спрайт иконок и контейнер уведомлений
src/main.js                 точка входа: загрузка данных и монтирование App
src/App.svelte              шапка, переключение экранов, нижнее меню
src/screens/*.svelte        экраны: Home, Catalog, Article, Tools, Lab, Favorites, Settings
src/components/*.svelte     Icon, ArticleCards, QuizCard, LabBar, Calculator, Journal
src/store.svelte.js         реактивное состояние, сохранение в localStorage, тема
src/router.js               навигация и история (кнопка «Назад»)
src/backup.js               экспорт и импорт резервной копии
src/quiz.js, toast.js, utils.js
src/styles.css              глобальные стили
src/data/*.json             контент: разделы, статьи, ошибки, сравнения
```

Чтобы добавить или исправить статью, достаточно отредактировать `src/data/articles.json`.
