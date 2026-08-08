import { describe, it, expect } from 'vitest';
import { parsePostDate } from './parse-date.mjs';

describe('parsePostDate', () => {
  it('작성날짜 YY.MM.DD를 2000년대로 해석한다', () => {
    expect(parsePostDate('## 제목\n> 작성날짜: 24.09.11\n\n본문')).toBe('2024-09-11');
  });

  it('탐구 일자 YYYY-MM-DD를 파싱한다', () => {
    expect(parsePostDate('## 제목\n> 📅 탐구 일자: 2024-10-28\n')).toBe('2024-10-28');
  });

  it('줄 끝 HTML 태그를 무시한다', () => {
    expect(parsePostDate('> 작성날짜: 24.11.17 </br>\n')).toBe('2024-11-17');
  });

  it('업데이트 날짜가 병기되면 최초 작성일을 쓴다', () => {
    expect(parsePostDate('> 작성날짜: 24.08.29 (업데이트 날짜: 24.09.11)\n')).toBe('2024-08-29');
  });

  it('한 자리 월일도 0으로 채운다', () => {
    expect(parsePostDate('> 작성날짜: 25.4.7\n')).toBe('2025-04-07');
  });

  it('날짜 줄이 없으면 null을 반환한다', () => {
    expect(parsePostDate('## 제목\n\n본문만 있음')).toBeNull();
  });

  it('본문 뒷부분의 날짜 비슷한 문자열에 속지 않는다', () => {
    const md = '## 제목\n\n본문에서 24.01.01 같은 숫자를 언급함';
    expect(parsePostDate(md)).toBeNull();
  });

  it('첫 번째 날짜 줄만 사용한다', () => {
    const md = '> 작성날짜: 24.09.11\n\n> 작성날짜: 25.01.01\n';
    expect(parsePostDate(md)).toBe('2024-09-11');
  });
});
