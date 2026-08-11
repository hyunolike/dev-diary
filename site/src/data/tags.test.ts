import { describe, it, expect } from 'vitest';
import { TAGS } from './tags';

describe('태그 어휘', () => {
  it('중복이 없다', () => {
    expect(new Set(TAGS).size).toBe(TAGS.length);
  });

  it('대소문자만 다른 항목이 없다', () => {
    const lowered = TAGS.map((t) => t.toLowerCase());
    expect(new Set(lowered).size).toBe(TAGS.length);
  });

  it('앞뒤 공백이 없다', () => {
    for (const t of TAGS) expect(t).toBe(t.trim());
  });
});
