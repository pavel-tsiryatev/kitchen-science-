import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
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
