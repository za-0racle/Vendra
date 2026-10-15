import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  // Saved reference pages are not part of the published site; only referenced assets are bundled.
  publicDir: false,
  build: { rollupOptions: { input: { shop: resolve('index.html'), admin: resolve('admin.html') } } }
});
