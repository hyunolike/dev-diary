import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeRaw from 'rehype-raw';
import rehypeLocalImages from './src/plugins/rehype-local-images.mjs';
import rehypeStripTitleHeading from './src/plugins/rehype-strip-title-heading.mjs';

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
      //
      // rehypeStripTitleHeading은 rehypeRaw 다음, Astro 내부 rehypeHeadingIds
      // (우리가 지정한 rehypePlugins 전부가 끝난 뒤에 실행됨)보다는 먼저 와야
      // 한다 — 그래야 frontmatter title과 겹치는 첫 헤딩이 목차용 headings
      // 배열에 아예 들어가지 않는다.
      rehypePlugins: [
        rehypeRaw,
        rehypeStripTitleHeading,
        [rehypeLocalImages, { base: BASE }],
      ],
    }),
  },
});
