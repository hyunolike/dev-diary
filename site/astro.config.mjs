import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeRaw from 'rehype-raw';
import rehypeLocalImages from './src/plugins/rehype-local-images.mjs';

const BASE = '/dev-diary';

export default defineConfig({
  site: 'https://hyunolike.github.io',
  base: BASE,
  build: { format: 'directory' },
  markdown: {
    processor: unified({
      // 소스에 <img> 원본 HTML 태그로 박힌 이미지가 다수 있다. remark-rehype는
      // allowDangerousHtml로 그런 원본 HTML을 파싱하지 않은 'raw' 노드로 남겨두고,
      // Astro 내부 파이프라인은 우리가 지정한 rehypePlugins *이후*에야 자체
      // rehype-raw를 돌려 그 노드들을 실제 element로 파싱한다. 그 순서 그대로 두면
      // rehypeLocalImages가 방문할 때 <img> 태그가 아직 element가 아니라서
      // 못 잡는다 — 그래서 여기서 rehypeLocalImages보다 먼저 rehype-raw를 직접
      // 돌려 <img> 원본 태그를 element로 만들어둔다.
      rehypePlugins: [rehypeRaw, [rehypeLocalImages, { base: BASE }]],
    }),
  },
});
