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

  it('title과 일치하는 헤딩이 맨 앞에 연달아 두 개 있으면 둘 다 제거한다', async () => {
    const html = await render(
      '## 제목\n\n### 제목\n\n내용입니다.',
      '제목',
    );
    expect(html).not.toContain('<h2>');
    expect(html).not.toContain('<h3>');
    expect(html).toContain('내용입니다.');
  });

  it('title 헤딩, 다른 헤딩, 다시 title 헤딩 순이면 맨 앞 것만 제거한다', async () => {
    const html = await render(
      '## 제목\n\n### 다른 소제목\n\n#### 제목\n\n내용입니다.',
      '제목',
    );
    expect(html).not.toContain('<h2>제목</h2>');
    expect(html).toContain('<h3>다른 소제목</h3>');
    expect(html).toContain('<h4>제목</h4>');
  });

  it('두 title 헤딩 사이에 인용구가 끼어도 구간이 끊기지 않는다 (Jackson 글 형태)', async () => {
    const html = await render(
      '## Jackson이 JSON 직렬화하는 방식\n> 작성날짜: 25.07.14\n\n### Jackson이 JSON 직렬화하는 방식\n> 설명입니다.\n\n내용입니다.',
      'Jackson이 JSON 직렬화하는 방식',
    );
    expect(html).not.toContain('<h2>');
    expect(html).not.toContain('<h3>');
    expect(html).toContain('설명입니다.');
    expect(html).toContain('내용입니다.');
  });
});
