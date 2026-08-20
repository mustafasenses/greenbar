import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// base: './' — böylece build, GitHub Pages'te alt dizinden de servis edilebilir.
export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  build: { target: 'es2022' },
});
