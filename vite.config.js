import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { articlesPlugin } from './scripts/content.mjs';

// Статьи справочника — Markdown-файлы в content/articles (см. docs/CONTENT.md)
const ARTICLES_DIR = fileURLToPath(new URL('./content/articles', import.meta.url));
const GLOSSARY_FILE = fileURLToPath(new URL('./content/glossary.yaml', import.meta.url));

// Версия приложения: в CI — VERSION_NAME (1.0.0-dev.57 или 1.2.0), локально — из package.json
const APP_VERSION = process.env.VERSION_NAME || JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version;

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(APP_VERSION) },
  plugins: [svelte(), articlesPlugin(ARTICLES_DIR, GLOSSARY_FILE)],
  // Относительные пути: сборка работает и в WebView Capacitor, и при открытии с диска
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  // В тестах Svelte должен резолвиться в браузерную сборку (руны $state в .svelte.js)
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'jsdom',
    restoreMocks: true,
  },
});
