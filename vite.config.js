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
});
