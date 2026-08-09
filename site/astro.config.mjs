import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeLocalImages from './src/plugins/rehype-local-images.mjs';

const BASE = '/dev-diary';

export default defineConfig({
  site: 'https://hyunolike.github.io',
  base: BASE,
  build: { format: 'directory' },
  markdown: {
    processor: unified({
      rehypePlugins: [[rehypeLocalImages, { base: BASE }]],
    }),
  },
});
