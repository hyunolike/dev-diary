import { describe, it, expect } from 'vitest';
import { VFile } from 'vfile';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeStripTitleHeading from './rehype-strip-title-heading.mjs';

async function render(md: string, title: string) {
  const file = new VFile({ value: md, data: { astro: { frontmatter: { title } } } });
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStripTitleHeading)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(file);
  return String(result);
}

describe('rehypeStripTitleHeading', () => {
  it('본문 맨 앞 헤딩이 title과 정확히 같으면 제거한다', async () => {
    const html = await render('## 주문 서버 개발기 2편 (설계)\n\n내용입니다.', '주문 서버 개발기 2편 (설계)');
    expect(html).not.toContain('<h2>');
    expect(html).toContain('내용입니다.');
  });

  it('본문 맨 앞 헤딩이 title과 다르면 그대로 둔다', async () => {
    const html = await render('## 설계 필요\n\n내용입니다.', '주문 서버 개발기 2편 (설계)');
    expect(html).toContain('<h2>설계 필요</h2>');
  });

  it('title과 같은 텍스트라도 본문 중간에 있으면 건드리지 않는다', async () => {
    const html = await render(
      '첫 문단입니다.\n\n## 주문 서버 개발기 2편 (설계)\n\n내용입니다.',
      '주문 서버 개발기 2편 (설계)',
    );
    expect(html).toContain('<h2>주문 서버 개발기 2편 (설계)</h2>');
  });

  it('헤딩이 없는 글은 그대로 둔다', async () => {
    const html = await render('그냥 문단만 있는 글입니다.', '아무 제목');
    expect(html).toBe('<p>그냥 문단만 있는 글입니다.</p>');
  });
});
