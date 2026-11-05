import { defineConfig } from 'vite';

export default defineConfig({
  // Относительные пути: сборка работает и в WebView Capacitor, и при открытии с диска
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
