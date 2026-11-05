import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { articlesPlugin } from './scripts/content.mjs';

// Статьи справочника — Markdown-файлы в content/articles (см. docs/CONTENT.md)
const ARTICLES_DIR = fileURLToPath(new URL('./content/articles', import.meta.url));

export default defineConfig({
  plugins: [svelte(), articlesPlugin(ARTICLES_DIR)],
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
