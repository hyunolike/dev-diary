import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeLocalImages from './rehype-local-images.mjs';

const MANIFEST = { 'aaa-111': { width: 1216, height: 700 } };

async function render(md: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeLocalImages, { manifest: MANIFEST, base: '/dev-diary' })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  return String(file);
}

describe('rehypeLocalImages', () => {
  it('raw <img> 태그의 src를 로컬 경로로 치환한다', async () => {
    const html = await render('<img width="1216" alt="설계도" src="https://github.com/user-attachments/assets/aaa-111" />');
    expect(html).toContain('src="/dev-diary/img/aaa-111.webp"');
  });

  it('마크다운 이미지 문법도 치환한다', async () => {
    const html = await render('![설계도](https://github.com/user-attachments/assets/aaa-111)');
    expect(html).toContain('src="/dev-diary/img/aaa-111.webp"');
  });

  it('매니페스트의 실제 크기를 width/height로 설정한다', async () => {
    const html = await render('<img width="1216" src="https://github.com/user-attachments/assets/aaa-111" />');
    expect(html).toContain('width="1216"');
    expect(html).toContain('height="700"');
  });

  it('원본 width를 style의 max-width로 옮긴다', async () => {
    const html = await render('<img width="530" src="https://github.com/user-attachments/assets/aaa-111" />');
    expect(html).toContain('max-width:min(530px,100%)');
  });

  it('선언된 width와 실제 크기가 다르면 속성은 실제 크기를 쓴다', async () => {
    const html = await render('<img width="530" src="https://github.com/user-attachments/assets/aaa-111" />');
    expect(html).toContain('width="1216"');
    expect(html).toContain('height="700"');
    expect(html).not.toContain('width="530"');
  });

  it('width 속성이 없으면 max-width도 실제 크기를 쓴다', async () => {
    const html = await render('<img src="https://github.com/user-attachments/assets/aaa-111" />');
    expect(html).toContain('width="1216"');
    expect(html).toContain('max-width:min(1216px,100%)');
  });

  it('lazy loading과 async decoding을 추가한다', async () => {
    const html = await render('<img src="https://github.com/user-attachments/assets/aaa-111" />');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it('alt를 보존한다', async () => {
    const html = await render('<img alt="설계도" src="https://github.com/user-attachments/assets/aaa-111" />');
    expect(html).toContain('alt="설계도"');
  });

  it('user-attachments가 아닌 이미지는 건드리지 않는다', async () => {
    const html = await render('<img src="https://img.shields.io/badge/x.svg" />');
    expect(html).toContain('src="https://img.shields.io/badge/x.svg"');
    expect(html).not.toContain('loading="lazy"');
  });

  it('매니페스트에 없는 UUID를 만나면 예외를 던진다', async () => {
    await expect(
      render('<img src="https://github.com/user-attachments/assets/missing-999" />'),
    ).rejects.toThrow(/missing-999/);
  });
});
