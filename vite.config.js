import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
export default defineConfig({
  // Saved reference pages are not part of the published site; only referenced assets are bundled.
  publicDir: false,
  plugins: [{ name: 'brand-metadata-assets', generateBundle() { for (const name of ['vendra-icon-180.png', 'vendra-logo.png']) this.emitFile({type:'asset', fileName:name, source:readFileSync(resolve('public',name))}); } }],
  build: { rollupOptions: { input: { shop: resolve('index.html'), admin: resolve('admin.html'), track: resolve('track.html') } } }
});
