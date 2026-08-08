import { describe, it, expect } from 'vitest';
import { joinBase } from './href';

describe('joinBase', () => {
  it('base와 경로 사이에 슬래시를 하나만 둔다', () => {
    expect(joinBase('/dev-diary', '/archive')).toBe('/dev-diary/archive');
  });

  it('base 끝의 슬래시를 중복시키지 않는다', () => {
    expect(joinBase('/dev-diary/', '/archive')).toBe('/dev-diary/archive');
  });

  it('경로 앞 슬래시가 없어도 붙인다', () => {
    expect(joinBase('/dev-diary', 'archive')).toBe('/dev-diary/archive');
  });

  it('루트 경로는 base 자체로 정규화한다', () => {
    expect(joinBase('/dev-diary', '/')).toBe('/dev-diary/');
  });

  it('base가 루트일 때도 동작한다', () => {
    expect(joinBase('/', '/archive')).toBe('/archive');
  });

  it('쿼리 문자열을 보존한다', () => {
    expect(joinBase('/dev-diary', '/archive?tags=Kotlin')).toBe('/dev-diary/archive?tags=Kotlin');
  });

  it('외부 URL은 그대로 통과시킨다', () => {
    expect(joinBase('/dev-diary', 'https://github.com/hyunolike')).toBe('https://github.com/hyunolike');
  });
});
