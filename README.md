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

```
index.html              разметка-оболочка (шапка, нижнее меню, спрайт иконок)
src/main.js             точка входа
src/styles.css          стили
src/store.js            состояние, сохранение в localStorage, тема
src/router.js           навигация и история (кнопка «Назад»)
src/quiz.js, toast.js, a11y.js, utils.js
src/screens/            экраны: home, catalog, article, tools, lab, favorites, settings
src/data/*.json         контент: разделы, статьи, ошибки, сравнения
```

Чтобы добавить или исправить статью, достаточно отредактировать `src/data/articles.json`.
