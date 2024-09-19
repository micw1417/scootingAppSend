// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: '../dist',
    emptyOutDir: true, 
  },
  rollupOptions: {
    input: 'index.html', // Specify the entry point
  },
});