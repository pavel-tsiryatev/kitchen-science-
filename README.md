# Кухня: наука вкуса

Офлайн-справочник по кулинарной науке: статьи, диагностика ошибок, калькуляторы и журнал экспериментов. Android-приложение собирается через Capacitor.

## Разработка

```bash
npm install
npm run dev       # локальный сервер с горячей перезагрузкой
npm run build     # сборка в dist/
npm run preview   # просмотр собранной версии
npm run android   # сборка + подготовка Android-проекта (иконки, версия, плагины)
```

## Тесты

```bash
npm test             # всё: юнит-тесты и сценарии в браузере
npm run test:unit    # Vitest: контент, логика, хранилище, резервная копия (~5 с)
npm run test:watch   # Vitest в режиме наблюдения
npm run test:e2e     # Playwright: сценарии пользователя на собранном приложении
```

Перед первым запуском сценариев: `npx playwright install chromium`.
Тесты запускаются в GitHub Actions на каждом PR и пуше в `main`.

| Где | Что проверяется |
|---|---|
| `tests/unit/data.test.js` | целостность контента: поля статей, ссылки между статьями, вопросы, источники |
| `tests/unit/content.test.js` | разбор Markdown-статей и понятные ошибки для авторов |
| `tests/unit/store.test.js` | проверка и загрузка сохранённых данных, повреждённые данные, тема |
| `tests/unit/native.test.js` | Android: миграция в Preferences, объединение записей, «Поделиться» |
| `tests/unit/backup.test.js` | экспорт и импорт резервной копии, ошибки, сброс прогресса |
| `tests/unit/quiz.test.js`, `utils.test.js` | порядок вариантов, ответы, числа и форматирование |
| `tests/e2e/*.spec.js` | навигация и «Назад», поиск, статья, калькуляторы, журнал, настройки |

## Android-сборки и релизы

Тестовая сборка появляется после каждого пуша в `main`, релиз — по тегу `v1.2.3`.
Подробности и настройка подписи — в [docs/RELEASE.md](docs/RELEASE.md).

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
src/native.js               Android: хранилище Preferences, сохранение файла через «Поделиться»
assets/                     исходники иконки и заставки (logo.svg → PNG)
scripts/                    подготовка Android-проекта, создание ключа подписи
src/quiz.js, toast.js, utils.js
src/styles.css              глобальные стили
src/data/*.json             контент: разделы, ошибки, сравнения
content/articles/*.md       статьи справочника (Markdown + источники)
content/glossary.yaml       глоссарий терминов (ссылки в статьях, экран «Глоссарий»)
src/search.js               поиск: русский стемминг Snowball, ранжирование, подсветка
```

Чтобы добавить или исправить статью, отредактируйте файл в `content/articles/` —
формат и правила доказательности описаны в [docs/CONTENT.md](docs/CONTENT.md).
Источники сверяются с научными базами командой `npm run verify:sources`.
