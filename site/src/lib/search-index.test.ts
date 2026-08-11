import { describe, it, expect } from 'vitest';
import { stripMarkdown } from './search-index';

describe('stripMarkdown', () => {
  it('frontmatter를 제거한다', () => {
    expect(stripMarkdown('---\ntitle: x\n---\n본문입니다')).toBe('본문입니다');
  });

  it('코드 블록을 통째로 제거한다', () => {
    const md = '앞\n```kotlin\nval x = 1\n```\n뒤';
    const out = stripMarkdown(md);
    expect(out).toContain('앞');
    expect(out).toContain('뒤');
    expect(out).not.toContain('val x');
  });

  it('HTML 태그를 제거한다', () => {
    expect(stripMarkdown('<img src="x" />텍스트')).toBe('텍스트');
  });

  it('인라인 코드의 백틱만 벗긴다', () => {
    expect(stripMarkdown('`Semaphore`를 썼다')).toBe('Semaphore를 썼다');
  });

  it('링크는 표시 텍스트만 남긴다', () => {
    expect(stripMarkdown('[토스 블로그](https://toss.tech/x) 참고')).toBe('토스 블로그 참고');
  });

  it('제목 기호와 인용 기호를 제거한다', () => {
    expect(stripMarkdown('## 제목\n> 인용문')).toBe('제목 인용문');
  });

  it('연속 공백을 하나로 접는다', () => {
    expect(stripMarkdown('가\n\n\n나')).toBe('가 나');
  });

  it('한글 조사가 붙은 단어를 부분 문자열로 찾을 수 있다', () => {
    const out = stripMarkdown('레디스를 활용한 캐시 전략');
    expect(out.includes('레디스')).toBe(true);
  });
});
