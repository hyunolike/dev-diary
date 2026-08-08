import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parsePostDate } from './parse-date.mjs';

const ROOT = new URL('../../../', import.meta.url).pathname;
const DIRS = ['개인', 'inner-circle', '업무', 'k8s', 'oss', '기업-기술-블로그-탐구-일지', '오픈소스-프로젝트-분석-일지'];

describe('실제 코퍼스', () => {
  it('52편 중 정확히 48편에서 날짜를 뽑는다', () => {
    const files = DIRS.flatMap((d) =>
      readdirSync(join(ROOT, d)).filter((f) => f.endsWith('.md')).map((f) => join(ROOT, d, f)),
    );
    expect(files.length).toBe(52);
    const parsed = files.filter((f) => parsePostDate(readFileSync(f, 'utf8')) !== null);
    expect(parsed.length).toBe(48);
  });
});
