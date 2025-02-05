import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  publicDir: './assets',
  clean: true,
  minify: true,
  format: ['esm'],
});
