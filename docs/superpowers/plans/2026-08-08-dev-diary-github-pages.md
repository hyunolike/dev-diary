# dev-diary 아카이브 사이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `dev-diary` 저장소의 기술 기록 52편을 채용담당자용 정적 사이트로 만들어 `https://hyunolike.github.io/dev-diary/`에 배포한다.

**Architecture:** Astro 7 정적 빌드. 원본 마크다운은 저장소 루트에 그대로 두고 frontmatter만 주입해 Astro 콘텐츠 컬렉션으로 읽는다. 본문 이미지 187개는 사전에 내려받아 WebP로 변환한 뒤 `public/`에서 서빙하고, rehype 플러그인이 빌드 시 `<img src>`를 로컬 경로로 치환한다. 인터랙션은 UI 프레임워크 없이 `.astro` 파일의 순수 `<script>`로 구현한다.

**Tech Stack:** Astro 7.2.0, TypeScript, Zod (Astro 내장), sharp, vitest, GitHub Actions

## Global Constraints

- Node 22 이상. 로컬 확인 버전은 v22.23.2
- Astro는 `7.2.0` 이상 8 미만
- 배포 URL은 `https://hyunolike.github.io/dev-diary/` — `site: 'https://hyunolike.github.io'`, `base: '/dev-diary'`
- 기본 브랜치는 `develop`. 작업 브랜치는 `site/github-pages`
- 원본 `.md` 52편에 가하는 변경은 frontmatter 주입뿐. 본문과 이미지 URL은 한 글자도 수정하지 않는다
- 사이트 코드는 전부 `site/` 하위. 저장소 루트는 글 디렉터리와 `README.md`, `docs/`만 유지
- 노출 금지: 경력 연차, 재직 회사, 이메일, GitLab 링크, 인프런 링크. 외부 링크는 GitHub 프로필(`https://github.com/hyunolike`) 하나뿐
- 표시 이름은 `장현호`
- UI 프레임워크 통합(React/Vue/Svelte/Preact/Solid)을 추가하지 않는다. 인터랙션은 `.astro`의 `<script>`로만 구현한다
- 모든 내부 링크와 asset 경로는 `href()` 헬퍼(Task 1)를 통과시킨다. `base`가 루트가 아니므로 직접 문자열로 쓰면 배포 후에만 깨진다
- 태그는 `site/src/data/tags.ts`에 정의된 어휘 밖의 값을 쓸 수 없다
- 커밋 메시지는 한국어로 쓰고 본문에 이유를 남긴다

## File Structure

| 파일 | 책임 |
|---|---|
| `site/astro.config.mjs` | site/base, rehype 플러그인 등록, 마크다운 설정 |
| `site/src/lib/href.ts` | base를 붙인 URL 생성. 모든 링크의 단일 통로 |
| `site/src/lib/parse-date.mjs` | 본문 날짜 줄 → ISO 날짜 문자열. `.ts`가 아닌 이유는 `scripts/*.mjs`도 같은 로직을 import해야 하기 때문 |
| `site/src/lib/parse-date.d.ts` | 위 모듈의 타입 선언 |
| `site/src/lib/search-index.ts` | 컬렉션 → 검색 인덱스 레코드 변환 |
| `site/src/data/tags.ts` | 태그 어휘 (Zod enum의 원천) |
| `site/src/data/series.ts` | 시리즈 슬러그 → 표시 이름/설명/순서 |
| `site/src/data/image-manifest.json` | uuid → 변환 후 실제 width/height |
| `site/src/plugins/rehype-local-images.mjs` | `<img src>` 치환 + 크기/lazy 속성 주입 |
| `site/src/content.config.ts` | 컬렉션 정의 + Zod 스키마 |
| `site/scripts/fetch-images.mjs` | 이미지 다운로드 + WebP 변환 + 매니페스트 생성 (일회성) |
| `site/scripts/scaffold-frontmatter.mjs` | frontmatter 기계적 필드 생성 (일회성) |
| `site/scripts/check-links.mjs` | `dist/` 링크·이미지 경로 검사 |
| `site/src/styles/tokens.css` | 색·타이포·간격 토큰, 다크모드 |
| `site/src/layouts/Base.astro` | HTML 뼈대, 폰트, 다크모드 스크립트, View Transitions |
| `site/src/layouts/Post.astro` | 글 상세 레이아웃 + TOC |
| `site/src/components/*.astro` | PostCard, TagChip, Timeline, SeriesFlow, SearchArchive, TableOfContents |
| `site/src/pages/index.astro` | 랜딩 |
| `site/src/pages/archive.astro` | 아카이브 (검색·필터·타임라인) |
| `site/src/pages/posts/[slug].astro` | 글 상세 |
| `site/src/pages/series/[slug].astro` | 시리즈 |
| `site/src/pages/tags/[tag].astro` | 태그별 목록 |
| `.github/workflows/deploy.yml` | 빌드 + Pages 배포 |

---

### Task 1: 프로젝트 스캐폴딩과 배포 파이프라인

빈 사이트가 GitHub Pages에 실제로 뜨는 것까지가 이 태스크의 결과물이다. 배포를 마지막으로 미루면 `base` 경로 문제가 모든 작업이 끝난 뒤에야 드러난다.

**Files:**
- Create: `site/package.json`, `site/astro.config.mjs`, `site/tsconfig.json`
- Create: `site/src/lib/href.ts`, `site/src/pages/index.astro`
- Create: `site/vitest.config.ts`, `site/src/lib/href.test.ts`
- Create: `.github/workflows/deploy.yml`
- Create: `site/.gitignore`
- Modify: `.gitmodules` (삭제)

**Interfaces:**
- Produces: `href(path: string): string` — `site/src/lib/href.ts`의 default가 아닌 named export. 이후 모든 태스크가 링크 생성에 사용한다

- [ ] **Step 1: Astro 프로젝트 생성**

```bash
cd /Users/hyuno/orca/dev-diary
npm create astro@latest site -- --template minimal --no-install --no-git --skip-houston --typescript strict
cd site && npm install && npm install -D vitest sharp
```

`npm ls astro`로 버전이 7.2.0 이상인지 확인한다. 낮으면 `npm install astro@latest`.

- [ ] **Step 2: href 헬퍼의 실패하는 테스트 작성**

`base`가 `/dev-diary`일 때 Astro의 `BASE_URL`은 환경에 따라 끝 슬래시가 붙기도, 안 붙기도 한다. 헬퍼가 이를 흡수해야 링크가 `//`나 누락으로 깨지지 않는다.

`site/src/lib/href.test.ts`:

```ts
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
```

`site/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
```

- [ ] **Step 3: 테스트가 실패하는지 확인**

Run: `cd site && npx vitest run src/lib/href.test.ts`
Expected: FAIL — `Failed to resolve import "./href"`

- [ ] **Step 4: href 헬퍼 구현**

`site/src/lib/href.ts`:

```ts
export function joinBase(base: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (p === '/') return `${b}/`;
  return `${b}${p}`;
}

export function href(path: string): string {
  return joinBase(import.meta.env.BASE_URL, path);
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd site && npx vitest run src/lib/href.test.ts`
Expected: PASS — 7 tests

- [ ] **Step 6: astro.config.mjs 설정**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://hyunolike.github.io',
  base: '/dev-diary',
  build: { format: 'directory' },
});
```

- [ ] **Step 7: 배포 확인용 임시 랜딩 작성**

`site/src/pages/index.astro`:

```astro
---
import { href } from '../lib/href';
---
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>장현호 · dev-diary</title>
  </head>
  <body>
    <h1>장현호</h1>
    <p>배포 파이프라인 확인용 임시 페이지입니다.</p>
    <a href={href('/archive')}>아카이브</a>
  </body>
</html>
```

- [ ] **Step 8: package.json 스크립트 정리**

`site/package.json`의 `scripts`를 다음으로 맞춘다.

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "fetch-images": "node scripts/fetch-images.mjs",
    "check-links": "node scripts/check-links.mjs"
  }
}
```

- [ ] **Step 9: 로컬 빌드 확인**

Run: `cd site && npm run build`
Expected: 성공. `site/dist/index.html`이 생성되고 그 안의 링크가 `/dev-diary/archive`로 나온다.

Run: `grep -o '/dev-diary/archive' site/dist/index.html`
Expected: `/dev-diary/archive` 출력

- [ ] **Step 10: 빈 서브모듈 제거**

`.gitmodules`의 `study.langchain`은 디렉터리가 비어 있어 CI 체크아웃에서 혼선을 준다.

```bash
cd /Users/hyuno/orca/dev-diary
git rm --cached study.langchain 2>/dev/null || true
rm -f .gitmodules
rmdir study.langchain 2>/dev/null || true
```

- [ ] **Step 11: 워크플로 작성**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [develop]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6
        with:
          path: ./site
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 12: site/.gitignore 작성**

```
dist/
node_modules/
.astro/
```

`site/public/img/`는 무시하지 않는다. 변환된 이미지는 커밋 대상이다.

- [ ] **Step 13: 커밋**

```bash
cd /Users/hyuno/orca/dev-diary
git add site .github/workflows/deploy.yml
git add -A .gitmodules study.langchain 2>/dev/null || true
git commit -m "$(cat <<'EOF'
Astro 프로젝트 스캐폴딩과 GitHub Pages 배포 파이프라인 구성

base가 /dev-diary라 링크를 직접 문자열로 쓰면 로컬에서는 멀쩡하고 배포 후에만
깨진다. 모든 링크가 지나갈 href 헬퍼를 먼저 만들고 테스트로 고정했다.

빈 서브모듈 study.langchain은 CI 체크아웃에서 혼선을 주므로 제거했다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 14: 배포 확인**

`develop`에 병합하기 전이므로 GitHub Actions 탭에서 `workflow_dispatch`로 수동 실행한다. 저장소 Settings > Pages에서 Source를 "GitHub Actions"로 먼저 설정해야 한다(수동 1회).

Expected: `https://hyunolike.github.io/dev-diary/`가 열리고 "장현호"가 보인다. 아카이브 링크는 404지만(아직 페이지 없음) 주소가 `/dev-diary/archive`로 맞아야 한다.

---

### Task 2: 날짜 파서

52편 중 50편은 본문에 날짜 줄이 있고 라벨이 세 가지다 (작성날짜, 탐구 일자, 분석 일자). 꼬리가 붙은 케이스가 둘 있어 정규식만으로는 부족하다.

**Files:**
- Create: `site/src/lib/parse-date.mjs`, `site/src/lib/parse-date.d.ts`
- Test: `site/src/lib/parse-date.test.ts`

**Interfaces:**
- Produces: `parsePostDate(markdown: string): string | null` — 본문 전체를 받아 `YYYY-MM-DD`를 반환하거나, 날짜 줄이 없으면 `null`

**`.ts`가 아니라 `.mjs`인 이유:** Task 6의 `scripts/scaffold-frontmatter.mjs`가 같은 파싱 로직을 필요로 한다. `.ts`로 두면 스크립트가 import할 수 없어 정규식을 복제하게 되고, 두 곳이 벌어지면 스캐폴딩이 만든 날짜와 사이트가 읽는 날짜가 어긋난다. 로직은 한 곳에만 둔다.

- [ ] **Step 1: 실패하는 테스트 작성**

`site/src/lib/parse-date.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parsePostDate } from './parse-date.mjs';

describe('parsePostDate', () => {
  it('작성날짜 YY.MM.DD를 2000년대로 해석한다', () => {
    expect(parsePostDate('## 제목\n> 작성날짜: 24.09.11\n\n본문')).toBe('2024-09-11');
  });

  it('탐구 일자 YYYY-MM-DD를 파싱한다', () => {
    expect(parsePostDate('## 제목\n> 📅 탐구 일자: 2024-10-28\n')).toBe('2024-10-28');
  });

  it('분석 일자 YYYY-MM-DD를 파싱한다', () => {
    expect(parsePostDate('## 제목\n> 📅 분석 일자: 2024-10-07\n')).toBe('2024-10-07');
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
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `cd site && npx vitest run src/lib/parse-date.test.ts`
Expected: FAIL — `Failed to resolve import "./parse-date.mjs"`

- [ ] **Step 3: 구현**

`site/src/lib/parse-date.mjs`:

```js
const LINE = /^>\s*(?:📅\s*)?(?:작성날짜|탐구 일자|분석 일자|작성일)\s*[::]\s*(.+)$/m;
const YMD_FULL = /^(\d{4})-(\d{1,2})-(\d{1,2})/;
const YMD_SHORT = /^(\d{2})\.(\d{1,2})\.(\d{1,2})/;

const pad = (n) => String(n).padStart(2, '0');

export function parsePostDate(markdown) {
  const line = markdown.match(LINE);
  if (!line) return null;

  const value = line[1].trim();

  const full = value.match(YMD_FULL);
  if (full) return `${full[1]}-${pad(full[2])}-${pad(full[3])}`;

  const short = value.match(YMD_SHORT);
  if (short) return `20${short[1]}-${pad(short[2])}-${pad(short[3])}`;

  return null;
}
```

`site/src/lib/parse-date.d.ts`:

```ts
export declare function parsePostDate(markdown: string): string | null;
```

정규식이 줄 시작(`^>`)에 고정돼 있어 본문 중간의 날짜 문자열에는 걸리지 않는다. `match`는 첫 일치만 반환하므로 날짜 줄이 여럿이어도 첫 번째를 쓴다. 값 뒤의 `</br>`나 `(업데이트 날짜: ...)`는 앵커된 패턴이 앞부분만 소비하므로 자동으로 무시된다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd site && npx vitest run src/lib/parse-date.test.ts`
Expected: PASS — 9 tests

- [ ] **Step 5: 실제 52편에 돌려 확인**

`.mjs`라 node로 바로 돌릴 수 있다. 어느 파일이 날짜를 못 뽑는지 이름까지 확인한다.

```bash
cd /Users/hyuno/orca/dev-diary/site
node --input-type=module -e "
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parsePostDate } from './src/lib/parse-date.mjs';
const DIRS = ['개인','inner-circle','업무','k8s','oss','기업-기술-블로그-탐구-일지','오픈소스-프로젝트-분석-일지'];
let total = 0; const missing = [];
for (const d of DIRS) for (const f of readdirSync(join('..', d))) {
  if (!f.endsWith('.md')) continue;
  total++;
  if (parsePostDate(readFileSync(join('..', d, f), 'utf8')) === null) missing.push(d + '/' + f);
}
console.log('전체', total, '/ 날짜 없음', missing.length);
missing.forEach(m => console.log('  ' + m));
"
```

Expected: `전체 52 / 날짜 없음 2`, 그리고 스펙 6절이 지목한 그 2개 파일(`업무/SVN 주요 용어 설명.md`, `개인/macOS + zsh …`)과 정확히 일치.

추가로 코퍼스 테스트를 영구 테스트로 남긴다. `site/src/lib/parse-date.corpus.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parsePostDate } from './parse-date.mjs';

const ROOT = new URL('../../../', import.meta.url).pathname;
const DIRS = ['개인', 'inner-circle', '업무', 'k8s', 'oss', '기업-기술-블로그-탐구-일지', '오픈소스-프로젝트-분석-일지'];

describe('실제 코퍼스', () => {
  it('52편 중 정확히 50편에서 날짜를 뽑는다', () => {
    const files = DIRS.flatMap((d) =>
      readdirSync(join(ROOT, d)).filter((f) => f.endsWith('.md')).map((f) => join(ROOT, d, f)),
    );
    expect(files.length).toBe(52);
    const parsed = files.filter((f) => parsePostDate(readFileSync(f, 'utf8')) !== null);
    expect(parsed.length).toBe(50);
  });
});
```

Run: `cd site && npx vitest run src/lib/parse-date.corpus.test.ts`
Expected: PASS. 실패하면 위 node 명령이 출력한 파일 목록으로 정규식을 보완한다.

이 테스트는 삭제하지 않고 남긴다. 나중에 글이 추가되거나 날짜 표기가 바뀌면 여기서 잡힌다.

- [ ] **Step 6: 커밋**

```bash
git add site/src/lib/parse-date.mjs site/src/lib/parse-date.d.ts \
       site/src/lib/parse-date.test.ts site/src/lib/parse-date.corpus.test.ts
git commit -m "$(cat <<'EOF'
본문 날짜 줄 파서 추가

52편 중 50편이 본문에 날짜를 갖고 있고 라벨이 세 가지다. 값 뒤에 </br>가
붙거나 업데이트 날짜가 괄호로 병기된 케이스가 있어 앵커된 패턴으로 앞부분만
소비하도록 했다. 본문 중간의 날짜 비슷한 문자열에 걸리지 않도록 줄 시작의
인용 기호에 고정했다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: 태그 어휘와 시리즈 데이터

**Files:**
- Create: `site/src/data/tags.ts`, `site/src/data/series.ts`
- Test: `site/src/data/tags.test.ts`

**Interfaces:**
- Produces: `TAGS: readonly string[]`, `TagName` 타입 — `site/src/data/tags.ts`
- Produces: `SERIES: Record<string, { name: string; description: string }>`, `SeriesSlug` 타입 — `site/src/data/series.ts`

- [ ] **Step 1: 태그 어휘 작성**

`site/src/data/tags.ts`:

```ts
export const TAGS = [
  'Kotlin', 'Java', 'JavaScript',
  'Spring Boot', 'Spring Security', 'JPA', 'Vue',
  'Kubernetes', 'Docker', 'AWS', 'Linux',
  'Redis', 'Kafka', 'RabbitMQ', 'Oracle', 'MySQL', 'MongoDB', 'SQLite',
  'DDD', '멀티모듈', '트랜잭션', '동시성', '아키텍처',
  '테스트', 'API 문서화', '리팩터링',
  'Git', 'SVN', 'Gradle', 'CI/CD',
] as const;

export type TagName = (typeof TAGS)[number];
```

이 배열이 Zod enum의 원천이다. 여기 없는 태그를 frontmatter에 쓰면 빌드가 실패한다.

- [ ] **Step 2: 어휘 무결성 테스트 작성**

`site/src/data/tags.test.ts`:

```ts
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
```

- [ ] **Step 3: 테스트 통과 확인**

Run: `cd site && npx vitest run src/data/tags.test.ts`
Expected: PASS — 3 tests

- [ ] **Step 4: 시리즈 데이터 작성**

`site/src/data/series.ts`:

```ts
export const SERIES = {
  'order-server': {
    name: '주문 서버 개발기',
    description:
      '6개 도메인이 얽힌 커머스 주문을 멀티모듈로 분리하고, 내부/외부 통신과 트랜잭션 경계를 설계해 구현하기까지의 3부작',
  },
  'gstreamer-oss': {
    name: '오픈소스 GStreamer 기여기',
    description: '듀얼부팅 환경 준비부터 로컬 빌드, 기여를 위한 커밋 정리까지의 기록',
  },
  svn: {
    name: 'SVN 실무 정리',
    description: '레거시 형상관리 도구를 실무에서 다루며 정리한 개념·프로세스·충돌 해결',
  },
  k8s: {
    name: 'Kubernetes 운영 기록',
    description: 'CNI 플러그인 장애, Pod 네트워크 권한 문제, Finalizer 교착의 진단과 해소',
  },
} as const;

export type SeriesSlug = keyof typeof SERIES;
```

- [ ] **Step 5: 커밋**

```bash
git add site/src/data/
git commit -m "$(cat <<'EOF'
태그 어휘와 시리즈 메타데이터 정의

태그를 자유 입력으로 두면 k8s와 Kubernetes가 갈려 필터가 무너진다. 어휘를
배열로 못 박고 Zod enum의 원천으로 삼는다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 이미지 다운로드와 WebP 변환

**Files:**
- Create: `site/scripts/fetch-images.mjs`
- Generate: `site/public/img/<uuid>.webp` (187개), `site/src/data/image-manifest.json`

**Interfaces:**
- Consumes: 저장소 루트의 `.md` 52편
- Produces: `site/src/data/image-manifest.json` — `{ "<uuid>": { "width": number, "height": number } }`. Task 5의 rehype 플러그인이 읽는다

- [ ] **Step 1: 스크립트 작성**

`site/scripts/fetch-images.mjs`:

```js
import { readFileSync, readdirSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const OUT_DIR = join(HERE, '..', 'public', 'img');
const MANIFEST = join(HERE, '..', 'src', 'data', 'image-manifest.json');

const DIRS = ['개인', 'inner-circle', '업무', 'k8s', 'oss', '기업-기술-블로그-탐구-일지', '오픈소스-프로젝트-분석-일지'];
const UUID_RE = /https:\/\/github\.com\/user-attachments\/assets\/([a-zA-Z0-9-]+)/g;
const MAX_WIDTH = 1600;

function collectUuids() {
  const uuids = new Set();
  for (const dir of DIRS) {
    for (const file of readdirSync(join(ROOT, dir))) {
      if (!file.endsWith('.md')) continue;
      const md = readFileSync(join(ROOT, dir, file), 'utf8');
      for (const m of md.matchAll(UUID_RE)) uuids.add(m[1]);
    }
  }
  return [...uuids];
}

async function fetchOne(uuid) {
  const url = `https://github.com/user-attachments/assets/${uuid}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36',
      Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`${uuid}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const uuids = collectUuids();
  console.log(`발견한 이미지: ${uuids.length}개`);

  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  const failed = [];

  for (const [i, uuid] of uuids.entries()) {
    const out = join(OUT_DIR, `${uuid}.webp`);
    if (existsSync(out) && manifest[uuid]) {
      console.log(`[${i + 1}/${uuids.length}] skip ${uuid}`);
      continue;
    }
    try {
      const buf = await fetchOne(uuid);
      const img = sharp(buf, { animated: true });
      const meta = await img.metadata();
      const resized = meta.width > MAX_WIDTH ? img.resize({ width: MAX_WIDTH }) : img;
      const info = await resized.webp({ quality: 82 }).toFile(out);
      manifest[uuid] = { width: info.width, height: info.height };
      console.log(`[${i + 1}/${uuids.length}] ${uuid} ${info.width}x${info.height}`);
    } catch (err) {
      console.error(`[${i + 1}/${uuids.length}] FAIL ${uuid}: ${err.message}`);
      failed.push(uuid);
    }
  }

  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');

  console.log(`\n성공 ${Object.keys(manifest).length} / 발견 ${uuids.length}`);
  if (failed.length) {
    console.error(`실패 ${failed.length}개:\n${failed.join('\n')}`);
    process.exit(1);
  }
}

main();
```

이미 받은 파일은 건너뛰므로 중간에 실패해도 재실행하면 이어서 받는다. 매니페스트는 UUID 정렬 순으로 써서 재실행 시 diff가 지저분해지지 않는다.

- [ ] **Step 2: 실행**

Run: `cd site && npm run fetch-images`
Expected: `발견한 이미지: 187개`로 시작해 187개 전부 성공. 마지막 줄이 `성공 187 / 발견 187`.

실패가 나면 재실행한다. 반복 실패하는 UUID는 원본이 삭제된 것이므로 어느 글에 있는지 찾아 기록해 둔다.

```bash
grep -rl "<실패한-uuid>" --include="*.md" /Users/hyuno/orca/dev-diary
```

- [ ] **Step 3: 결과 검증**

```bash
cd /Users/hyuno/orca/dev-diary/site
echo -n "webp 파일 수: "; ls public/img/*.webp | wc -l
echo -n "매니페스트 항목 수: "; node -e "console.log(Object.keys(require('./src/data/image-manifest.json')).length)"
echo -n "총 용량: "; du -sh public/img
echo "=== 최대 폭이 1600 이하인지 ==="
node -e "
const m = require('./src/data/image-manifest.json');
const over = Object.entries(m).filter(([,v]) => v.width > 1600);
console.log(over.length === 0 ? 'OK' : 'FAIL: ' + JSON.stringify(over));
"
```

Expected: 187 / 187 / 8~15MB 범위 / `OK`

- [ ] **Step 4: 커밋**

```bash
cd /Users/hyuno/orca/dev-diary
git add site/scripts/fetch-images.mjs site/public/img site/src/data/image-manifest.json
git commit -m "$(cat <<'EOF'
본문 이미지 187개를 내려받아 WebP로 변환

원본이 8192x1892 PNG 같은 크기라 그대로 쓰면 LCP 기준을 못 맞춘다. GitHub이
매 요청마다 S3 presigned URL로 302 리다이렉트하는 것도 왕복을 늘린다.

Astro의 이미지 최적화는 raw <img> 태그에 적용되지 않는데 187개 중 170개가
그 형태다. 그래서 최적화를 Astro에 맡기지 않고 다운로드 시점에 sharp로
직접 수행한다. 매니페스트의 실제 크기는 레이아웃 시프트 방지용 width/height의
근거가 된다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: rehype 이미지 치환 플러그인

**Files:**
- Create: `site/src/plugins/rehype-local-images.mjs`
- Test: `site/src/plugins/rehype-local-images.test.ts`
- Modify: `site/astro.config.mjs`

**Interfaces:**
- Consumes: `site/src/data/image-manifest.json` (Task 4)
- Produces: rehype 플러그인 default export. `astro.config.mjs`의 `markdown.rehypePlugins`에 등록한다

- [ ] **Step 1: 실패하는 테스트 작성**

`site/src/plugins/rehype-local-images.test.ts`:

```ts
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
    expect(html).toContain('max-width:530px');
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
```

- [ ] **Step 2: 테스트 의존성 설치 후 실패 확인**

```bash
cd site && npm install -D unified remark-parse remark-rehype rehype-raw rehype-stringify unist-util-visit
npx vitest run src/plugins/rehype-local-images.test.ts
```

Expected: FAIL — `Failed to resolve import "./rehype-local-images.mjs"`

- [ ] **Step 3: 구현**

`site/src/plugins/rehype-local-images.mjs`:

```js
import { visit } from 'unist-util-visit';
import defaultManifest from '../data/image-manifest.json' with { type: 'json' };

const UUID_RE = /^https:\/\/github\.com\/user-attachments\/assets\/([a-zA-Z0-9-]+)$/;

export default function rehypeLocalImages(options = {}) {
  const manifest = options.manifest ?? defaultManifest;
  const base = (options.base ?? '/dev-diary').replace(/\/+$/, '');

  return (tree, file) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      const src = node.properties?.src;
      if (typeof src !== 'string') return;

      const match = src.match(UUID_RE);
      if (!match) return;

      const uuid = match[1];
      const size = manifest[uuid];
      if (!size) {
        throw new Error(
          `이미지 매니페스트에 ${uuid}가 없습니다 (${file?.path ?? '알 수 없는 파일'}). ` +
            `npm run fetch-images를 다시 실행하세요.`,
        );
      }

      const declaredWidth = Number(node.properties.width);
      const maxWidth = Number.isFinite(declaredWidth) && declaredWidth > 0 ? declaredWidth : size.width;

      node.properties.src = `${base}/img/${uuid}.webp`;
      node.properties.width = size.width;
      node.properties.height = size.height;
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
      node.properties.style = `max-width:${maxWidth}px;height:auto`;
    });
  };
}
```

`width`/`height` 속성은 브라우저가 종횡비를 계산하는 용도라 실제 픽셀 값이어야 한다. 원본 태그의 `width`는 표시 폭 의도이므로 `style`의 `max-width`로 옮긴다. `height:auto`를 함께 주지 않으면 축소 시 세로가 늘어난다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd site && npx vitest run src/plugins/rehype-local-images.test.ts`
Expected: PASS — 8 tests

- [ ] **Step 5: astro.config.mjs에 등록**

```js
import { defineConfig } from 'astro/config';
import rehypeLocalImages from './src/plugins/rehype-local-images.mjs';

const BASE = '/dev-diary';

export default defineConfig({
  site: 'https://hyunolike.github.io',
  base: BASE,
  build: { format: 'directory' },
  markdown: {
    rehypePlugins: [[rehypeLocalImages, { base: BASE }]],
  },
});
```

Astro는 마크다운 안의 raw HTML을 기본으로 통과시키므로 `rehype-raw`를 별도 등록할 필요가 없다. 등록 후 실제 글에서 `<img>`가 엘리먼트 노드로 잡히는지는 Task 8에서 확인한다.

- [ ] **Step 6: 커밋**

```bash
git add site/src/plugins/ site/astro.config.mjs site/package.json site/package-lock.json
git commit -m "$(cat <<'EOF'
이미지 src를 로컬 WebP로 치환하는 rehype 플러그인 추가

본문 이미지 187개 중 170개가 raw <img> 태그다. remark는 raw HTML을 통짜
문자열 노드로만 보기 때문에 이 170개를 다룰 수 없다. 마크다운을 HTML로
변환한 뒤의 AST를 다루는 rehype 단계에서는 두 문법이 모두 정상 엘리먼트로
잡힌다.

원본 태그의 width는 표시 폭 의도이므로 style의 max-width로 옮기고, 속성의
width/height는 브라우저가 종횡비를 계산하도록 실제 픽셀 값으로 덮어쓴다.

매니페스트에 없는 UUID는 조용히 넘기지 않고 빌드를 실패시킨다. 넘어가면
깨진 이미지가 그대로 배포된다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: frontmatter 주입과 콘텐츠 컬렉션

기계적으로 뽑을 수 있는 필드는 스크립트가 채우고, 판단이 필요한 `tags`/`summary`/`featured`만 사람이 글을 읽고 쓴다.

**Files:**
- Create: `site/scripts/scaffold-frontmatter.mjs`
- Create: `site/src/content.config.ts`
- Modify: 저장소 루트의 `.md` 52편 (frontmatter 주입)

**Interfaces:**
- Consumes: `parsePostDate` (Task 2), `TAGS` (Task 3), `SERIES` (Task 3)
- Produces: `posts` 컬렉션. 스키마는 아래 Step 3에 정의. 이후 모든 페이지 태스크가 `getCollection('posts')`로 읽는다

- [ ] **Step 1: 스캐폴딩 스크립트 작성**

`site/scripts/scaffold-frontmatter.mjs`:

```js
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { parsePostDate } from '../src/lib/parse-date.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const DIRS = ['개인', 'inner-circle', '업무', 'k8s', 'oss', '기업-기술-블로그-탐구-일지', '오픈소스-프로젝트-분석-일지'];

function gitFirstCommitDate(path) {
  const out = execSync(
    `git log --diff-filter=A --format=%aI --reverse -- "${path.replace(/"/g, '\\"')}"`,
    { cwd: ROOT, encoding: 'utf8' },
  ).trim();
  return out.split('\n')[0]?.slice(0, 10) ?? null;
}

function extractTitle(md, fallback) {
  const h = md.match(/^#{1,2}\s+(.+)$/m);
  return h ? h[1].trim() : fallback;
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[「」`'"()[\]{}.,·]/g, '')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

for (const dir of DIRS) {
  for (const file of readdirSync(join(ROOT, dir))) {
    if (!file.endsWith('.md')) continue;
    const path = join(ROOT, dir, file);
    const md = readFileSync(path, 'utf8');

    if (md.startsWith('---\n')) {
      console.log(`skip (이미 frontmatter 있음): ${dir}/${file}`);
      continue;
    }

    const title = extractTitle(md, basename(file, '.md'));
    const date = parsePostDate(md) ?? gitFirstCommitDate(join(dir, file));
    const fm = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `slug: ${slugify(title)}`,
      `date: ${date}`,
      `category: ${dir}`,
      'tags: []                 # TODO: site/src/data/tags.ts의 어휘에서 고를 것',
      'summary: ""              # TODO: 글을 읽고 한두 문장으로',
      'featured: false',
      '---',
      '',
    ].join('\n');

    writeFileSync(path, fm + md);
    console.log(`wrote: ${dir}/${file} (date=${date})`);
  }
}
```

- [ ] **Step 2: 실행 후 결과 확인**

Run: `cd site && node scripts/scaffold-frontmatter.mjs`
Expected: 52줄의 `wrote:` 출력. `date=null`이 하나도 없어야 한다.

```bash
cd /Users/hyuno/orca/dev-diary
echo -n "date=null 개수: "; node -e "0" ; grep -rl "^date: null" --include="*.md" . | wc -l
echo -n "슬러그 중복: "
grep -rh "^slug: " --include="*.md" 개인 inner-circle 업무 k8s oss 기업-기술-블로그-탐구-일지 오픈소스-프로젝트-분석-일지 | sort | uniq -d
```

Expected: `date=null 개수: 0`, 슬러그 중복 없음. 중복이 있으면 해당 글의 `slug`를 손으로 구분되게 고친다.

- [ ] **Step 3: 콘텐츠 컬렉션 스키마 작성**

`site/src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { TAGS } from './data/tags';
import { SERIES } from './data/series';

const CATEGORIES = [
  '개인', 'inner-circle', '업무', 'k8s', 'oss',
  '기업-기술-블로그-탐구-일지', '오픈소스-프로젝트-분석-일지',
] as const;

const posts = defineCollection({
  loader: glob({
    pattern: `{${CATEGORIES.join(',')}}/**/*.md`,
    base: '../',
  }),
  schema: z
    .object({
      title: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9가-힣-]+$/, '슬러그는 소문자·숫자·한글·하이픈만 허용합니다'),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      category: z.enum(CATEGORIES),
      tags: z.array(z.enum(TAGS)).min(1, '태그를 최소 1개 지정하세요'),
      series: z.enum(Object.keys(SERIES) as [string, ...string[]]).optional(),
      seriesOrder: z.number().int().positive().optional(),
      summary: z.string().min(10, '요약을 10자 이상 쓰세요'),
      featured: z.boolean().default(false),
    })
    .refine((d) => !d.series || d.seriesOrder !== undefined, {
      message: 'series를 지정하면 seriesOrder도 필요합니다',
      path: ['seriesOrder'],
    }),
});

export const collections = { posts };
```

- [ ] **Step 4: 빌드가 실패하는지 확인**

Run: `cd site && npm run build`
Expected: FAIL — 52편 전부 `tags`가 빈 배열이고 `summary`가 빈 문자열이라 Zod가 거부한다. 이것이 정상이다. 스키마가 실제로 작동한다는 증거다.

- [ ] **Step 5: 52편의 tags/summary/featured 채우기**

각 글을 열어 읽고 세 필드를 채운다. 규칙:

- `tags`: `site/src/data/tags.ts`의 어휘에서만 고른다. 글당 2~4개. 어휘에 없는 개념이 반복해서 필요하면 어휘에 추가하되, **최소 2편 이상에 붙는 태그만** 추가한다
- `summary`: 글을 읽고 한두 문장. **본문 첫 줄을 복사하지 않는다** — 상당수 글이 목차나 시리즈 안내로 시작한다. "무엇을 왜 했는가"가 드러나야 한다
- `featured`: 아래 4건이 속한 글에만 `true`
- `series`/`seriesOrder`: 아래 매핑대로 추가

**시리즈 매핑 (기계적으로 확정됨):**

| 파일 | series | seriesOrder |
|---|---|---|
| `inner-circle/주문 서버 개발기 1편 (도메인).md` | `order-server` | 1 |
| `inner-circle/주문 서버 개발기 2편 (설계).md` | `order-server` | 2 |
| `inner-circle/주문 서버 개발기 3편 (구현) (feat.지속 가능한 소프트웨어).md` | `order-server` | 3 |
| `oss/네이티브 환경의 X86_64 환경에서 리눅스 듀얼부팅 준비해보자.md` | `gstreamer-oss` | 1 |
| `oss/로컬 환경 구축하기.md` | `gstreamer-oss` | 2 |
| `oss/오픈소스 기여를 위한 Commit 정리.md` | `gstreamer-oss` | 3 |
| `업무/SVN에 대해 알아보자.md` | `svn` | 1 |
| `업무/SVN 주요 용어 설명.md` | `svn` | 2 |
| `업무/SVN 병합 프로세스.md` | `svn` | 3 |
| `업무/SVN 병합 충돌은 어떻게 해결할까.md` | `svn` | 4 |
| `업무/SVN vs Git 작업 프로세스 비교.md` | `svn` | 5 |
| `k8s/Pod 문제 해결을 위한 명령어 모음.md` | `k8s` | 1 |
| `k8s/모니터링 설치 시 CNI 플러그인 이슈.md` | `k8s` | 2 |
| `k8s/네트워크 권한 문제로 인한 Pod 연결 장애.md` | `k8s` | 3 |
| `k8s/Kubernetes Finalizer 정리.md` | `k8s` | 4 |

**featured: true로 지정할 글:**

| 파일 | 이유 |
|---|---|
| `inner-circle/주문 서버 개발기 2편 (설계).md` | 시리즈 대표. 설계 판단이 가장 잘 드러남 |
| `inner-circle/Swagger 개선기 feat. 커스텀 어노테이션, ISP (인터페이스분리원칙).md` | 문제 인식 → 원칙 적용 → 개선의 서사 |
| `inner-circle/API 문서 자동화 적용 (Spring REST Docs & Swagger UI) feat. OAS 기반 API 문서화.md` | 두 도구의 장단을 저울질한 선택 |
| `k8s/네트워크 권한 문제로 인한 Pod 연결 장애.md` | 인프라 장애 진단 대표 |

- [ ] **Step 6: 빌드 통과 확인**

Run: `cd site && npm run build`
Expected: PASS. Zod 오류 0건.

```bash
cd site && node -e "
const fs=require('fs');
const dirs=['개인','inner-circle','업무','k8s','oss','기업-기술-블로그-탐구-일지','오픈소스-프로젝트-분석-일지'];
let n=0, noTag=0, shortSum=0;
for(const d of dirs) for(const f of fs.readdirSync('../'+d)) {
  if(!f.endsWith('.md')) continue; n++;
  const s=fs.readFileSync('../'+d+'/'+f,'utf8');
  if(/^tags: \[\]/m.test(s)) noTag++;
  if(/^summary: \"\"/m.test(s)) shortSum++;
}
console.log('글', n, '/ 빈 태그', noTag, '/ 빈 요약', shortSum);
"
```

Expected: `글 52 / 빈 태그 0 / 빈 요약 0`

- [ ] **Step 7: 커밋**

```bash
cd /Users/hyuno/orca/dev-diary
git add -A
git commit -m "$(cat <<'EOF'
글 52편에 frontmatter 주입하고 콘텐츠 컬렉션 정의

기계적으로 뽑히는 title/slug/date/category는 스크립트로 채우고, 판단이 필요한
tags/summary/featured만 글을 읽고 손으로 썼다. 요약은 본문 첫 줄을 자르지
않았다. 상당수 글이 목차나 시리즈 안내로 시작해 요약으로 부적절하다.

Zod 스키마가 태그 어휘와 시리즈 정합성을 빌드 시점에 강제하므로 52편을 눈으로
검수할 필요가 없다. series를 쓰면 seriesOrder를 요구하는 refine도 걸었다.

본문은 수정하지 않았다. GitHub에서 원본을 직접 볼 때 기존 링크와 이미지가
그대로 동작한다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: 디자인 토큰과 기본 레이아웃

**Files:**
- Create: `site/src/styles/tokens.css`, `site/src/styles/prose.css`
- Create: `site/src/layouts/Base.astro`
- Create: `site/src/assets/fonts/` (Pretendard Variable, JetBrains Mono)

**Interfaces:**
- Produces: `Base.astro` — props `{ title: string; description?: string }`. 모든 페이지가 감싼다

- [ ] **Step 1: 폰트 내려받기**

`public/`이 아니라 `src/assets/fonts/`에 둔다. Vite가 처리해야 `base`가 반영된 경로로 재작성되기 때문이다.

```bash
cd /Users/hyuno/orca/dev-diary/site
mkdir -p src/assets/fonts
curl -sL -o src/assets/fonts/PretendardVariable.woff2 \
  https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2
curl -sL -o src/assets/fonts/JetBrainsMono.woff2 \
  https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/webfonts/JetBrainsMono-Regular.woff2
ls -lh src/assets/fonts
file src/assets/fonts/*.woff2
```

Expected: 두 파일 모두 0바이트가 아니고 `file`이 `Web Open Font Format (Version 2)`로 판별한다. HTML이 나오면 URL이 바뀐 것이므로 각 저장소의 최신 릴리스 경로를 확인한다.

- [ ] **Step 2: 디자인 토큰 작성**

`site/src/styles/tokens.css`:

폰트 경로를 `/dev-diary/fonts/...`로 하드코딩하지 않는다. CSS는 `href()`를 호출할 수 없고, Task 15의 링크 체커는 HTML 속성만 검사하므로 그 위반은 검사망에도 안 걸린다. `base`를 바꾸면 폰트만 조용히 깨진다.

대신 폰트를 `public/`이 아니라 `src/assets/fonts/`에 두고 **CSS에서 상대 경로로 참조**한다. Vite가 `url()`을 처리하면서 `base`가 반영된 해시 경로로 재작성하므로, `base`가 무엇이든 자동으로 맞는다. 부가 효과로 캐시 버스팅도 따라온다.

```css
@font-face {
  font-family: 'Pretendard';
  src: url('../assets/fonts/PretendardVariable.woff2') format('woff2-variations');
  font-weight: 45 920;
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('../assets/fonts/JetBrainsMono.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

:root {
  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

  --bg: #fbfbfa;
  --bg-raised: #ffffff;
  --border: #e4e4e1;
  --text: #1a1a18;
  --text-dim: #6b6b66;
  --accent: #2f6f5e;
  --accent-soft: #eaf2ef;
  --code-bg: #f4f4f2;

  --measure: 68ch;
  --radius: 10px;
  --space: 1rem;
}

:root[data-theme='dark'] {
  --bg: #131315;
  --bg-raised: #1b1b1e;
  --border: #2e2e33;
  --text: #e8e8e4;
  --text-dim: #9a9a94;
  --accent: #6fc4aa;
  --accent-soft: #1e2b28;
  --code-bg: #202024;
}

* { box-sizing: border-box; }

html {
  background: var(--bg);
  color-scheme: light;
}

html[data-theme='dark'] { color-scheme: dark; }

body {
  margin: 0;
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--accent); }

code, pre { font-family: var(--font-mono); }

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

카테고리별 색상은 두지 않는다. 7개 카테고리에 7색을 쓰면 산만해진다. 액센트는 하나뿐이다.

- [ ] **Step 3: 본문 스타일 작성**

`site/src/styles/prose.css`:

```css
.prose {
  max-width: var(--measure);
  margin: 0 auto;
}

.prose h2 { font-size: 1.5rem; margin-top: 2.5rem; line-height: 1.35; }
.prose h3 { font-size: 1.2rem; margin-top: 2rem; line-height: 1.4; }
.prose h4 { font-size: 1.05rem; margin-top: 1.5rem; }

.prose img {
  max-width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: block;
  margin: 1.5rem 0;
}

.prose pre {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: var(--radius);
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.6;
}

.prose :not(pre) > code {
  background: var(--code-bg);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
}

.prose blockquote {
  margin: 1.5rem 0;
  padding: 0.75rem 1rem;
  border-left: 3px solid var(--accent);
  background: var(--accent-soft);
  border-radius: 0 var(--radius) var(--radius) 0;
}

.prose blockquote > :first-child { margin-top: 0; }
.prose blockquote > :last-child { margin-bottom: 0; }

.prose table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  display: block;
  overflow-x: auto;
}

.prose th, .prose td {
  border: 1px solid var(--border);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.prose th { background: var(--code-bg); }
```

표와 코드 블록에 `overflow-x: auto`를 주는 것이 중요하다. 긴 표가 375px에서 페이지 전체를 가로로 밀면 검증 기준을 위반한다.

- [ ] **Step 4: Base 레이아웃 작성**

`site/src/layouts/Base.astro`:

```astro
---
import { ClientRouter } from 'astro:transitions';
import { href } from '../lib/href';
import pretendardUrl from '../assets/fonts/PretendardVariable.woff2?url';
import '../styles/tokens.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = '장현호의 백엔드 개발 기록 아카이브' } = Astro.props;

---

<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
    <link rel="preload" as="font" type="font/woff2" href={pretendardUrl} crossorigin />
    <script is:inline>
      (() => {
        const saved = localStorage.getItem('theme');
        const dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      })();
    </script>
    <ClientRouter />
  </head>
  <body>
    <header class="site-header">
      <a href={href('/')} class="brand">장현호</a>
      <nav>
        <a href={href('/archive')}>아카이브</a>
        <a href="https://github.com/hyunolike" rel="me noopener">GitHub</a>
        <button id="theme-toggle" type="button" aria-label="테마 전환">◐</button>
      </nav>
    </header>

    <main><slot /></main>

    <footer class="site-footer">
      <p>기록 52편 · 2024–2025</p>
      <p><a href="https://github.com/hyunolike/dev-diary">저장소 원본 보기</a></p>
    </footer>

    <script>
      const apply = () => {
        const btn = document.getElementById('theme-toggle');
        if (!btn || btn.dataset.bound) return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', () => {
          const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.dataset.theme = next;
          localStorage.setItem('theme', next);
        });
      };
      apply();
      document.addEventListener('astro:page-load', apply);
    </script>

    <style>
      .site-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        max-width: 72rem;
        margin: 0 auto;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--border);
      }
      .brand { font-weight: 700; text-decoration: none; color: var(--text); }
      .site-header nav { display: flex; align-items: center; gap: 1rem; font-size: 0.9rem; }
      #theme-toggle {
        background: none;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        color: var(--text);
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        font-size: 0.9rem;
      }
      main { max-width: 72rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
      .site-footer {
        max-width: 72rem;
        margin: 0 auto;
        padding: 2rem 1.25rem;
        border-top: 1px solid var(--border);
        color: var(--text-dim);
        font-size: 0.875rem;
      }
      .site-footer p { margin: 0.25rem 0; }
    </style>
  </body>
</html>
```

다크모드 초기화는 `is:inline` 스크립트로 `<head>`에서 실행해야 한다. 번들된 스크립트로 하면 첫 페인트가 밝은 색으로 나왔다가 바뀌는 깜빡임이 생긴다. 토글 바인딩은 View Transitions 이후에도 다시 붙도록 `astro:page-load`를 함께 듣는다.

- [ ] **Step 5: 임시 랜딩을 Base로 감싸 확인**

`site/src/pages/index.astro`를 수정한다.

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="장현호 · dev-diary">
  <h1>장현호</h1>
  <p>레이아웃 확인용 임시 페이지입니다.</p>
</Base>
```

Run: `cd site && npm run build && npm run preview`
Expected: `http://localhost:4321/dev-diary/`에서 헤더·푸터가 보이고 테마 토글이 동작한다. 새로고침해도 선택한 테마가 유지되고 깜빡임이 없다.

- [ ] **Step 6: 커밋**

```bash
git add site/src/styles site/src/layouts site/src/pages/index.astro site/src/assets/fonts
git commit -m "$(cat <<'EOF'
디자인 토큰과 기본 레이아웃 구성

글래스모피즘은 쓰지 않았다. 2026년 기준으로 이미 흔해서 템플릿을 쓴 것처럼
보인다. 절제된 타이포그래피 중심으로 가고 액센트는 한 색만 둔다. 카테고리가
7개인데 7색을 쓰면 산만해지므로 색 대신 라벨로 구분한다.

다크모드 초기화는 head의 인라인 스크립트로 처리했다. 번들 스크립트로 하면
첫 페인트가 밝게 나왔다가 바뀌는 깜빡임이 생긴다.

표와 코드 블록에 overflow-x를 줘서 375px에서 페이지가 가로로 밀리지 않게 했다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: 글 상세 페이지와 목차

**Files:**
- Create: `site/src/pages/posts/[slug].astro`
- Create: `site/src/layouts/Post.astro`
- Create: `site/src/components/TableOfContents.astro`
- Create: `site/src/components/TagChip.astro`

**Interfaces:**
- Consumes: `posts` 컬렉션 (Task 6), `href` (Task 1), `SERIES` (Task 3)
- Produces: `/posts/<slug>/` 52개 페이지

- [ ] **Step 1: TagChip 컴포넌트**

`site/src/components/TagChip.astro`:

```astro
---
import { href } from '../lib/href';

interface Props { tag: string; count?: number }
const { tag, count } = Astro.props;
---
<a class="chip" href={href(`/tags/${encodeURIComponent(tag)}`)}>
  {tag}{count !== undefined && <span class="count">{count}</span>}
</a>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    font-size: 0.8rem;
    text-decoration: none;
    color: var(--text-dim);
    background: var(--bg-raised);
  }
  .chip:hover { border-color: var(--accent); color: var(--accent); }
  .count { color: var(--text-dim); font-variant-numeric: tabular-nums; }
</style>
```

- [ ] **Step 2: 목차 컴포넌트**

`site/src/components/TableOfContents.astro`:

```astro
---
interface Heading { depth: number; slug: string; text: string }
interface Props { headings: Heading[] }

const { headings } = Astro.props;
const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
---
{items.length > 2 && (
  <nav class="toc" aria-label="목차">
    <p class="toc-title">목차</p>
    <ul>
      {items.map((h) => (
        <li data-depth={h.depth}><a href={`#${h.slug}`}>{h.text}</a></li>
      ))}
    </ul>
  </nav>
)}

<script>
  const bind = () => {
    const links = document.querySelectorAll<HTMLAnchorElement>('.toc a');
    if (!links.length) return;
    const byId = new Map<string, HTMLAnchorElement>();
    links.forEach((a) => byId.set(decodeURIComponent(a.hash.slice(1)), a));

    const targets = [...byId.keys()]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          links.forEach((a) => a.removeAttribute('aria-current'));
          byId.get(e.target.id)?.setAttribute('aria-current', 'true');
        }
      },
      { rootMargin: '-10% 0px -80% 0px' },
    );
    targets.forEach((t) => observer.observe(t));
  };
  bind();
  document.addEventListener('astro:page-load', bind);
</script>

<style>
  .toc {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem 1.25rem;
    background: var(--bg-raised);
    font-size: 0.875rem;
  }
  .toc-title { margin: 0 0 0.5rem; font-weight: 600; color: var(--text-dim); }
  .toc ul { list-style: none; margin: 0; padding: 0; }
  .toc li[data-depth='3'] { padding-left: 0.85rem; }
  .toc a { color: var(--text-dim); text-decoration: none; display: block; padding: 0.15rem 0; }
  .toc a:hover { color: var(--accent); }
  .toc a[aria-current='true'] { color: var(--accent); font-weight: 600; }

  @media (min-width: 1100px) {
    .toc { position: sticky; top: 2rem; }
  }
</style>
```

- [ ] **Step 3: Post 레이아웃**

`site/src/layouts/Post.astro`:

```astro
---
import Base from './Base.astro';
import TagChip from '../components/TagChip.astro';
import TableOfContents from '../components/TableOfContents.astro';
import { href } from '../lib/href';
import { SERIES } from '../data/series';
import '../styles/prose.css';

interface Heading { depth: number; slug: string; text: string }

interface Props {
  title: string;
  date: string;
  category: string;
  tags: string[];
  summary: string;
  series?: string;
  seriesOrder?: number;
  seriesPosts?: { slug: string; title: string; seriesOrder: number }[];
  headings: Heading[];
}

const { title, date, category, tags, summary, series, seriesPosts = [], headings } = Astro.props;
const seriesMeta = series ? SERIES[series as keyof typeof SERIES] : null;
---

<Base title={`${title} · 장현호`} description={summary}>
  <article class="post">
    <header class="post-head">
      <p class="meta"><time datetime={date}>{date}</time> · {category}</p>
      <h1>{title}</h1>
      <p class="summary">{summary}</p>
      <div class="tags">{tags.map((t) => <TagChip tag={t} />)}</div>
    </header>

    {seriesMeta && (
      <aside class="series-box">
        <p class="series-name">
          시리즈 · <a href={href(`/series/${series}`)}>{seriesMeta.name}</a>
        </p>
        <ol>
          {seriesPosts.map((p) => (
            <li aria-current={p.title === title ? 'true' : undefined}>
              <a href={href(`/posts/${p.slug}`)}>{p.title}</a>
            </li>
          ))}
        </ol>
      </aside>
    )}

    <div class="post-body">
      <div class="prose"><slot /></div>
      <aside class="post-aside"><TableOfContents headings={headings} /></aside>
    </div>
  </article>

  <style>
    .post-head { max-width: var(--measure); margin: 0 auto 2rem; }
    .meta { color: var(--text-dim); font-size: 0.875rem; margin: 0 0 0.5rem; }
    .post-head h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); line-height: 1.3; margin: 0 0 0.75rem; }
    .summary { color: var(--text-dim); margin: 0 0 1rem; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }

    .series-box {
      max-width: var(--measure);
      margin: 0 auto 2.5rem;
      padding: 1rem 1.25rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--accent-soft);
      font-size: 0.9rem;
    }
    .series-name { margin: 0 0 0.5rem; font-weight: 600; }
    .series-box ol { margin: 0; padding-left: 1.2rem; }
    .series-box li[aria-current='true'] { font-weight: 600; }
    .series-box li[aria-current='true'] a { color: var(--text); text-decoration: none; }

    .post-body { display: block; }
    .post-aside { display: none; }

    @media (min-width: 1100px) {
      .post-body {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 15rem;
        gap: 3rem;
        align-items: start;
      }
      .post-body .prose { margin: 0; }
      .post-aside { display: block; }
    }
  </style>
</Base>
```

- [ ] **Step 4: 동적 라우트**

`site/src/pages/posts/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import Post from '../../layouts/Post.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts');

  const bySeries = new Map<string, typeof posts>();
  for (const p of posts) {
    if (!p.data.series) continue;
    const list = bySeries.get(p.data.series) ?? [];
    list.push(p);
    bySeries.set(p.data.series, list);
  }
  for (const list of bySeries.values()) {
    list.sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
  }

  return posts.map((post) => ({
    params: { slug: post.data.slug },
    props: {
      post,
      seriesPosts: post.data.series
        ? (bySeries.get(post.data.series) ?? []).map((p) => ({
            slug: p.data.slug,
            title: p.data.title,
            seriesOrder: p.data.seriesOrder ?? 0,
          }))
        : [],
    },
  }));
}

const { post, seriesPosts } = Astro.props;
const { Content, headings } = await render(post);
---

<Post
  title={post.data.title}
  date={post.data.date}
  category={post.data.category}
  tags={post.data.tags}
  summary={post.data.summary}
  series={post.data.series}
  seriesOrder={post.data.seriesOrder}
  seriesPosts={seriesPosts}
  headings={headings}
>
  <Content />
</Post>
```

- [ ] **Step 5: 빌드하고 이미지 치환 확인**

Run: `cd site && npm run build`
Expected: 성공. 52개 글 페이지 생성.

```bash
cd /Users/hyuno/orca/dev-diary/site
echo -n "글 페이지 수: "; find dist/posts -name index.html | wc -l
echo -n "남아있는 외부 이미지 참조: "; grep -rl "user-attachments" dist/ | wc -l
echo -n "로컬 이미지 참조: "; grep -rho '/dev-diary/img/[a-zA-Z0-9-]*\.webp' dist/ | sort -u | wc -l
```

Expected: `52` / `0` / `187`

외부 참조가 0이 아니면 rehype 플러그인이 해당 `<img>`를 못 잡은 것이다. 어느 파일인지 찾아 태그 형태를 확인한다.

- [ ] **Step 6: 실제 화면 확인**

Run: `cd site && npm run preview`

`http://localhost:4321/dev-diary/posts/주문-서버-개발기-2편-설계/`를 연다. 확인 항목:

- 이미지가 전부 보이고 로딩 중 레이아웃이 밀리지 않는다
- 시리즈 박스에 1·2·3편이 나오고 현재 글이 굵게 표시된다
- 1100px 이상에서 우측에 목차가 붙고, 스크롤하면 현재 항목이 강조된다
- 375px로 줄여도 가로 스크롤이 없다

- [ ] **Step 7: 커밋**

```bash
git add site/src/pages/posts site/src/layouts/Post.astro site/src/components
git commit -m "$(cat <<'EOF'
글 상세 페이지와 목차 구현

이미지 187개가 전부 로컬 WebP로 치환되는 것을 빌드 산출물에서 확인했다.
dist에 user-attachments 참조가 0건이다.

목차는 IntersectionObserver로 현재 위치를 표시하되 1100px 미만에서는 숨긴다.
좁은 화면에서 본문 위에 목차가 쌓이면 정작 글이 안 보인다.

시리즈 글은 같은 시리즈의 전체 목록을 상단에 노출해 앞뒤 편으로 바로 이동할
수 있게 했다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: 검색 인덱스 생성

**Files:**
- Create: `site/src/lib/search-index.ts`
- Test: `site/src/lib/search-index.test.ts`
- Create: `site/src/pages/search-index.json.ts`

**Interfaces:**
- Produces: `stripMarkdown(md: string): string`, `toSearchRecord(entry): SearchRecord`
- Produces: `/search-index.json` 정적 엔드포인트. 레코드 형태 `{ slug, title, summary, tags, category, date, body }`

- [ ] **Step 1: 실패하는 테스트 작성**

`site/src/lib/search-index.test.ts`:

```ts
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
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `cd site && npx vitest run src/lib/search-index.test.ts`
Expected: FAIL — `Failed to resolve import "./search-index"`

- [ ] **Step 3: 구현**

`site/src/lib/search-index.ts`:

```ts
export interface SearchRecord {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  date: string;
  body: string;
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toSearchRecord(entry: {
  body?: string;
  data: {
    slug: string;
    title: string;
    summary: string;
    tags: string[];
    category: string;
    date: string;
  };
}): SearchRecord {
  return {
    slug: entry.data.slug,
    title: entry.data.title,
    summary: entry.data.summary,
    tags: entry.data.tags,
    category: entry.data.category,
    date: entry.data.date,
    body: stripMarkdown(entry.body ?? ''),
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd site && npx vitest run src/lib/search-index.test.ts`
Expected: PASS — 8 tests

- [ ] **Step 5: 정적 엔드포인트**

`site/src/pages/search-index.json.ts`:

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { toSearchRecord } from '../lib/search-index';

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const records = posts
    .map(toSearchRecord)
    .sort((a, b) => b.date.localeCompare(a.date));

  return new Response(JSON.stringify(records), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
```

- [ ] **Step 6: 빌드하고 크기 확인**

Run: `cd site && npm run build`

```bash
cd site
echo -n "레코드 수: "; node -e "console.log(require('./dist/search-index.json').length)"
echo -n "원본 크기: "; du -h dist/search-index.json | cut -f1
echo -n "gzip 크기: "; gzip -c dist/search-index.json | wc -c | awk '{printf "%.0f KB\n", $1/1024}'
echo "=== 코드 블록이 새어 들어갔는지 ==="
node -e "
const r = require('./dist/search-index.json');
const bad = r.filter(x => x.body.includes('\`\`\`'));
console.log(bad.length === 0 ? 'OK' : 'FAIL: ' + bad.map(x=>x.slug).join(', '));
"
```

Expected: 레코드 52개, gzip 100KB 이하, `OK`

gzip이 150KB를 넘으면 `body`를 앞 3000자로 자른다. 본문 뒷부분까지 검색되지 않는 것보다 초기 로딩이 중요하다.

- [ ] **Step 7: 커밋**

```bash
git add site/src/lib/search-index.ts site/src/lib/search-index.test.ts site/src/pages/search-index.json.ts
git commit -m "$(cat <<'EOF'
검색 인덱스 생성 엔드포인트 추가

Pagefind나 lunr 같은 토크나이저 기반 라이브러리를 쓰지 않는다. 한글은
조사가 붙어서 "레디스를"로 검색하면 "레디스"가 든 글이 안 걸린다. 본문
총량이 245KB뿐이라 인덱스를 통째로 내려받아 부분 문자열로 매칭하는 편이
정확하고 단순하다.

코드 블록은 인덱스에서 제외했다. 변수명이나 import 문이 검색 결과를
오염시킨다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: 아카이브 페이지와 검색·태그 필터

**Files:**
- Create: `site/src/pages/archive.astro`
- Create: `site/src/components/PostCard.astro`
- Create: `site/src/components/SearchArchive.astro`

**Interfaces:**
- Consumes: `/search-index.json` (Task 9), `posts` 컬렉션 (Task 6)
- Produces: `/archive/` 페이지. URL 쿼리 `?tags=Kotlin,테스트`와 `?q=검색어`를 읽는다

- [ ] **Step 1: PostCard 컴포넌트**

`site/src/components/PostCard.astro`:

```astro
---
import { href } from '../lib/href';
import TagChip from './TagChip.astro';

interface Props {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  tags: string[];
}

const { slug, title, summary, date, category, tags } = Astro.props;
---
<article class="card">
  <p class="meta"><time datetime={date}>{date}</time> · {category}</p>
  <h3><a href={href(`/posts/${slug}`)}>{title}</a></h3>
  <p class="summary">{summary}</p>
  <div class="tags">{tags.map((t) => <TagChip tag={t} />)}</div>
</article>

<style>
  .card {
    padding: 1.25rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-raised);
    transition: border-color 0.15s ease;
  }
  .card:hover { border-color: var(--accent); }
  .meta { color: var(--text-dim); font-size: 0.8rem; margin: 0 0 0.4rem; }
  .card h3 { margin: 0 0 0.5rem; font-size: 1.05rem; line-height: 1.4; }
  .card h3 a { color: var(--text); text-decoration: none; }
  .card h3 a:hover { color: var(--accent); }
  .summary { color: var(--text-dim); font-size: 0.9rem; margin: 0 0 0.75rem; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
</style>
```

- [ ] **Step 2: 검색·필터 컴포넌트**

`site/src/components/SearchArchive.astro`:

```astro
---
import { href } from '../lib/href';

interface Props { tags: { name: string; count: number }[]; total: number }
const { tags, total } = Astro.props;
---

<section class="search-archive" data-index={href('/search-index.json')} data-base={href('/posts')}>
  <div class="controls">
    <input
      type="search"
      id="q"
      placeholder="제목·요약·본문에서 검색"
      autocomplete="off"
      aria-label="글 검색"
    />
    <p class="status" id="status" role="status">전체 {total}편</p>
  </div>

  <div class="tag-filter" role="group" aria-label="태그 필터">
    {tags.map((t) => (
      <button type="button" class="tag-btn" data-tag={t.name} aria-pressed="false">
        {t.name}<span class="count">{t.count}</span>
      </button>
    ))}
    <button type="button" class="tag-btn clear" id="clear-tags" hidden>필터 해제</button>
  </div>

  <div id="results" class="results"></div>
  <p id="empty" class="empty" hidden>조건에 맞는 글이 없습니다.</p>
</section>

<script>
  interface Record {
    slug: string; title: string; summary: string;
    tags: string[]; category: string; date: string; body: string;
  }

  const init = async () => {
    const root = document.querySelector<HTMLElement>('.search-archive');
    if (!root || root.dataset.ready) return;
    root.dataset.ready = '1';

    const input = root.querySelector<HTMLInputElement>('#q')!;
    const status = root.querySelector<HTMLElement>('#status')!;
    const results = root.querySelector<HTMLElement>('#results')!;
    const empty = root.querySelector<HTMLElement>('#empty')!;
    const clearBtn = root.querySelector<HTMLButtonElement>('#clear-tags')!;
    const tagBtns = [...root.querySelectorAll<HTMLButtonElement>('.tag-btn[data-tag]')];
    const postBase = root.dataset.base!;

    const records: Record[] = await fetch(root.dataset.index!).then((r) => r.json());
    const active = new Set<string>();

    const params = new URLSearchParams(location.search);
    const initialTags = params.get('tags');
    if (initialTags) initialTags.split(',').filter(Boolean).forEach((t) => active.add(t));
    const initialQ = params.get('q');
    if (initialQ) input.value = initialQ;

    const esc = (s: string) =>
      s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

    const render = () => {
      const q = input.value.trim().toLowerCase();
      const matched = records.filter((r) => {
        if (active.size && ![...active].every((t) => r.tags.includes(t))) return false;
        if (!q) return true;
        return (
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.body.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
        );
      });

      results.innerHTML = matched
        .map(
          (r) => `
          <article class="card">
            <p class="meta"><time datetime="${r.date}">${r.date}</time> · ${esc(r.category)}</p>
            <h3><a href="${postBase}/${encodeURIComponent(r.slug)}">${esc(r.title)}</a></h3>
            <p class="summary">${esc(r.summary)}</p>
            <div class="tags">${r.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
          </article>`,
        )
        .join('');

      empty.hidden = matched.length > 0;
      status.textContent =
        active.size || q ? `${matched.length}편 표시 중 (전체 ${records.length}편)` : `전체 ${records.length}편`;
      clearBtn.hidden = active.size === 0;

      const next = new URLSearchParams();
      if (active.size) next.set('tags', [...active].join(','));
      if (q) next.set('q', input.value.trim());
      const qs = next.toString();
      history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
    };

    const syncButtons = () => {
      tagBtns.forEach((b) => b.setAttribute('aria-pressed', String(active.has(b.dataset.tag!))));
    };

    tagBtns.forEach((btn) =>
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag!;
        active.has(tag) ? active.delete(tag) : active.add(tag);
        syncButtons();
        render();
      }),
    );

    clearBtn.addEventListener('click', () => {
      active.clear();
      syncButtons();
      render();
    });

    let timer: number;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = window.setTimeout(render, 120);
    });

    syncButtons();
    render();
  };

  init();
  document.addEventListener('astro:page-load', init);
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  #q {
    flex: 1 1 18rem;
    padding: 0.6rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-raised);
    color: var(--text);
    font-family: inherit;
    font-size: 0.95rem;
  }
  .status { margin: 0; color: var(--text-dim); font-size: 0.875rem; white-space: nowrap; }

  .tag-filter { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.75rem; }
  .tag-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-raised);
    color: var(--text-dim);
    font-family: inherit;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .tag-btn:hover { border-color: var(--accent); color: var(--accent); }
  .tag-btn[aria-pressed='true'] {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }
  .tag-btn .count { font-variant-numeric: tabular-nums; opacity: 0.7; }
  .tag-btn.clear { border-style: dashed; }

  .results { display: grid; gap: 1rem; grid-template-columns: 1fr; }
  @media (min-width: 700px) { .results { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

  .empty { color: var(--text-dim); text-align: center; padding: 3rem 0; }

  .results :global(.card) {
    padding: 1.25rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-raised);
  }
  .results :global(.card:hover) { border-color: var(--accent); }
  .results :global(.meta) { color: var(--text-dim); font-size: 0.8rem; margin: 0 0 0.4rem; }
  .results :global(.card h3) { margin: 0 0 0.5rem; font-size: 1.05rem; line-height: 1.4; }
  .results :global(.card h3 a) { color: var(--text); text-decoration: none; }
  .results :global(.card h3 a:hover) { color: var(--accent); }
  .results :global(.summary) { color: var(--text-dim); font-size: 0.9rem; margin: 0 0 0.75rem; }
  .results :global(.tags) { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .results :global(.chip) {
    padding: 0.2rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    font-size: 0.8rem;
    color: var(--text-dim);
  }
</style>
```

사용자 입력을 `innerHTML`에 넣으므로 `esc()`로 escape한다. 검색어는 DOM에 직접 넣지 않지만 레코드 값은 넣으므로 필요하다.

- [ ] **Step 3: 아카이브 페이지**

`site/src/pages/archive.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import SearchArchive from '../components/SearchArchive.astro';
import Timeline from '../components/Timeline.astro';

const posts = await getCollection('posts');

const counts = new Map<string, number>();
for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);

const tags = [...counts.entries()]
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko'));

const timeline = posts
  .map((p) => ({ date: p.data.date, category: p.data.category, title: p.data.title, slug: p.data.slug }))
  .sort((a, b) => a.date.localeCompare(b.date));
---

<Base title="아카이브 · 장현호" description="백엔드 개발 기록 52편">
  <h1>아카이브</h1>
  <p class="lead">2024년부터 2025년까지 쓴 기록 52편입니다.</p>

  <Timeline entries={timeline} />
  <SearchArchive tags={tags} total={posts.length} />

  <style>
    h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); margin: 0 0 0.5rem; }
    .lead { color: var(--text-dim); margin: 0 0 2rem; }
  </style>
</Base>
```

- [ ] **Step 4: 빌드 후 확인 (Timeline은 Task 11에서 만들므로 임시 스텁)**

Task 11을 먼저 하지 않는 경우 `site/src/components/Timeline.astro`에 임시 스텁을 둔다.

```astro
---
interface Props { entries: { date: string; category: string; title: string; slug: string }[] }
const { entries } = Astro.props;
---
<p style="color: var(--text-dim); font-size: 0.875rem;">타임라인 자리 ({entries.length}건)</p>
```

Run: `cd site && npm run build && npm run preview`

`http://localhost:4321/dev-diary/archive/`에서 확인:

- 52편이 카드로 표시된다
- 검색창에 `레디스`를 치면 관련 글만 남고 상태 문구가 바뀐다
- 태그를 두 개 누르면 교집합만 남는다
- 주소창이 `?tags=Kotlin,테스트`로 바뀐다
- 그 주소를 새 탭에서 열면 필터가 적용된 상태로 뜬다

- [ ] **Step 5: 커밋**

```bash
git add site/src/pages/archive.astro site/src/components/
git commit -m "$(cat <<'EOF'
아카이브 페이지와 검색·태그 필터 구현

필터 상태를 URL 쿼리에 반영했다. 랜딩의 기술 스택 뱃지가 이 주소로 링크하면
JS 없이도 필터가 걸린 상태로 진입하고, 링크 공유도 된다.

태그는 교집합으로 동작한다. Kotlin과 테스트를 함께 누르면 둘 다 달린 글만
남는다. 합집합이면 필터를 좁히는 데 쓸 수 없다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: 타임라인

**Files:**
- Create/Replace: `site/src/components/Timeline.astro`

**Interfaces:**
- Consumes: `{ date, category, title, slug }[]` (날짜 오름차순 정렬된 상태로 전달됨)

- [ ] **Step 1: 구현**

`site/src/components/Timeline.astro`:

```astro
---
import { href } from '../lib/href';

interface Entry { date: string; category: string; title: string; slug: string }
interface Props { entries: Entry[] }

const { entries } = Astro.props;

const byMonth = new Map<string, Entry[]>();
for (const e of entries) {
  const key = e.date.slice(0, 7);
  const list = byMonth.get(key) ?? [];
  list.push(e);
  byMonth.set(key, list);
}

const months = [...byMonth.keys()].sort();
const first = months[0];
const last = months[months.length - 1];

function monthRange(from: string, to: string): string[] {
  const out: string[] = [];
  let [y, m] = from.split('-').map(Number);
  const [ey, em] = to.split('-').map(Number);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

const allMonths = monthRange(first, last);
const max = Math.max(...[...byMonth.values()].map((v) => v.length));
---

<section class="timeline" aria-label="작성 시기 분포">
  <div class="bars">
    {allMonths.map((month) => {
      const list = byMonth.get(month) ?? [];
      const height = list.length === 0 ? 0 : Math.round((list.length / max) * 100);
      const label = `${month} · ${list.length}편`;
      return (
        <div class="col">
          <div
            class="bar"
            style={`height:${height}%`}
            data-count={list.length}
            title={label}
            aria-label={label}
          />
        </div>
      );
    })}
  </div>
  <div class="axis">
    <span>{first.replace('-', '.')}</span>
    <span>{last.replace('-', '.')}</span>
  </div>
</section>

<style>
  .timeline { margin-bottom: 2.5rem; }
  .bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 60px;
    padding-bottom: 2px;
    border-bottom: 1px solid var(--border);
  }
  .col { flex: 1 1 0; display: flex; align-items: flex-end; height: 100%; min-width: 3px; }
  .bar {
    width: 100%;
    background: var(--accent);
    border-radius: 2px 2px 0 0;
    opacity: 0.75;
    min-height: 0;
    transition: opacity 0.15s ease;
  }
  .bar[data-count='0'] { background: var(--border); opacity: 1; height: 2px !important; }
  .bar:hover { opacity: 1; }
  .axis {
    display: flex;
    justify-content: space-between;
    color: var(--text-dim);
    font-size: 0.75rem;
    margin-top: 0.4rem;
    font-variant-numeric: tabular-nums;
  }
</style>
```

월별 막대 그래프로 구현한다. 글이 없는 달도 빈 칸으로 표시해 공백이 드러나게 하는 것이 정직하다. 카테고리별 색상은 쓰지 않는다 — 액센트 하나로 통일한다는 디자인 원칙을 따른다.

`title` 속성으로 hover 시 정보를 주므로 별도 JS가 필요 없다.

- [ ] **Step 2: 빌드 후 확인**

Run: `cd site && npm run build && npm run preview`

`/dev-diary/archive/`에서 타임라인이 보이고, 막대에 마우스를 올리면 `2024-09 · 6편` 같은 툴팁이 뜬다. 375px에서 막대가 찌그러지되 가로 스크롤은 없어야 한다.

- [ ] **Step 3: 커밋**

```bash
git add site/src/components/Timeline.astro
git commit -m "$(cat <<'EOF'
아카이브 타임라인 추가

월별 막대 그래프로 작성 시기 분포를 보여준다. 글이 없는 달도 빈 칸으로
남겨 공백이 드러나게 했다. 숨기면 실제보다 촘촘해 보인다.

카테고리별 색상은 쓰지 않았다. 액센트 한 색으로 통일한다는 원칙을 따른다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: 시리즈 페이지

**Files:**
- Create: `site/src/pages/series/[slug].astro`
- Create: `site/src/components/SeriesFlow.astro`

**Interfaces:**
- Consumes: `SERIES` (Task 3), `posts` 컬렉션 (Task 6)
- Produces: `/series/<slug>/` 4개 페이지

- [ ] **Step 1: SeriesFlow 컴포넌트**

`site/src/components/SeriesFlow.astro`:

```astro
---
import { href } from '../lib/href';

interface Step { slug: string; title: string; label: string }
interface Props { steps: Step[]; currentSlug?: string }

const { steps, currentSlug } = Astro.props;
---

<ol class="flow">
  {steps.map((s, i) => (
    <li>
      <a
        href={href(`/posts/${s.slug}`)}
        class="node"
        aria-current={s.slug === currentSlug ? 'true' : undefined}
      >
        <span class="num">{i + 1}</span>
        <span class="label">{s.label}</span>
      </a>
      {i < steps.length - 1 && <span class="arrow" aria-hidden="true">→</span>}
    </li>
  ))}
</ol>

<style>
  .flow {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 0.5rem;
    list-style: none;
    margin: 0 0 2rem;
    padding: 0;
  }
  .flow li { display: flex; align-items: center; gap: 0.5rem; }
  .node {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-raised);
    text-decoration: none;
    color: var(--text);
    font-size: 0.9rem;
  }
  .node:hover { border-color: var(--accent); }
  .node[aria-current='true'] { border-color: var(--accent); background: var(--accent-soft); font-weight: 600; }
  .num {
    display: grid;
    place-items: center;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    background: var(--accent);
    color: var(--bg);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
  .arrow { color: var(--text-dim); }
  @media (max-width: 600px) {
    .flow { flex-direction: column; align-items: stretch; }
    .flow li { flex-direction: column; align-items: stretch; }
    .arrow { display: none; }
  }
</style>
```

- [ ] **Step 2: 시리즈 페이지**

`site/src/pages/series/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import SeriesFlow from '../../components/SeriesFlow.astro';
import { SERIES } from '../../data/series';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return Object.entries(SERIES).map(([slug, meta]) => ({
    params: { slug },
    props: {
      meta,
      posts: posts
        .filter((p) => p.data.series === slug)
        .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0)),
    },
  }));
}

const { meta, posts } = Astro.props;

const steps = posts.map((p) => ({
  slug: p.data.slug,
  title: p.data.title,
  label: p.data.title.replace(/^.*?(\d+편)\s*\(?([^)]*)\)?.*$/, '$1 $2').trim() || p.data.title,
}));
---

<Base title={`${meta.name} · 장현호`} description={meta.description}>
  <p class="kicker">시리즈 · {posts.length}편</p>
  <h1>{meta.name}</h1>
  <p class="lead">{meta.description}</p>

  <SeriesFlow steps={steps} />

  <div class="grid">
    {posts.map((p) => (
      <PostCard
        slug={p.data.slug}
        title={p.data.title}
        summary={p.data.summary}
        date={p.data.date}
        category={p.data.category}
        tags={p.data.tags}
      />
    ))}
  </div>

  <style>
    .kicker { color: var(--text-dim); font-size: 0.875rem; margin: 0 0 0.3rem; }
    h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); margin: 0 0 0.5rem; }
    .lead { color: var(--text-dim); max-width: var(--measure); margin: 0 0 2rem; }
    .grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
    @media (min-width: 700px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</Base>
```

- [ ] **Step 3: 라벨 결과 확인**

Run: `cd site && npm run build`

```bash
cd site && grep -o '<span class="label">[^<]*</span>' dist/series/order-server/index.html
```

Expected: `1편 도메인`, `2편 설계`, `3편 구현` 형태. `svn`/`k8s`/`gstreamer-oss`처럼 "N편" 패턴이 없는 시리즈는 전체 제목이 나온다. 너무 길면 `steps`의 `label` 계산을 시리즈별로 손보되, 정규식이 복잡해지면 `series.ts`에 편별 라벨을 직접 적는 편이 낫다.

- [ ] **Step 4: 화면 확인**

Run: `cd site && npm run preview`

`/dev-diary/series/order-server/`에서 `1편 도메인 → 2편 설계 → 3편 구현` 흐름이 보이고, 600px 미만에서 세로로 쌓이며 화살표가 사라진다.

- [ ] **Step 5: 커밋**

```bash
git add site/src/pages/series site/src/components/SeriesFlow.astro
git commit -m "$(cat <<'EOF'
시리즈 페이지와 흐름 다이어그램 구현

주문 서버 개발기가 도메인에서 설계, 구현으로 이어지는 구조가 목록으로는
드러나지 않는다. 단계를 다이어그램으로 보여주면 그 서사가 한눈에 보인다.

좁은 화면에서는 세로로 쌓고 화살표를 감춘다. 가로 배치를 유지하면 노드가
찌그러져 읽을 수 없다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: 태그별 목록 페이지

**Files:**
- Create: `site/src/pages/tags/[tag].astro`

**Interfaces:**
- Consumes: `posts` 컬렉션 (Task 6)
- Produces: `/tags/<tag>/` — 실제 사용된 태그 수만큼

- [ ] **Step 1: 구현**

`site/src/pages/tags/[tag].astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import { href } from '../../lib/href';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  const byTag = new Map<string, typeof posts>();

  for (const p of posts) {
    for (const t of p.data.tags) {
      const list = byTag.get(t) ?? [];
      list.push(p);
      byTag.set(t, list);
    }
  }

  return [...byTag.entries()].map(([tag, list]) => ({
    params: { tag },
    props: {
      tag,
      posts: list.sort((a, b) => b.data.date.localeCompare(a.data.date)),
    },
  }));
}

const { tag, posts } = Astro.props;
---

<Base title={`${tag} · 장현호`} description={`${tag} 관련 기록 ${posts.length}편`}>
  <p class="kicker">태그</p>
  <h1>{tag}</h1>
  <p class="lead">
    {posts.length}편 · <a href={href(`/archive?tags=${encodeURIComponent(tag)}`)}>아카이브에서 필터로 보기</a>
  </p>

  <div class="grid">
    {posts.map((p) => (
      <PostCard
        slug={p.data.slug}
        title={p.data.title}
        summary={p.data.summary}
        date={p.data.date}
        category={p.data.category}
        tags={p.data.tags}
      />
    ))}
  </div>

  <style>
    .kicker { color: var(--text-dim); font-size: 0.875rem; margin: 0 0 0.3rem; }
    h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); margin: 0 0 0.5rem; }
    .lead { color: var(--text-dim); margin: 0 0 2rem; }
    .grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
    @media (min-width: 700px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</Base>
```

- [ ] **Step 2: 빌드 확인**

Run: `cd site && npm run build`

```bash
cd site
echo -n "태그 페이지 수: "; find dist/tags -name index.html | wc -l
echo "=== 1편짜리 태그 (어휘에서 흡수 대상) ==="
node -e "
const r = require('./dist/search-index.json');
const c = {};
r.forEach(p => p.tags.forEach(t => c[t] = (c[t]||0)+1));
const single = Object.entries(c).filter(([,n]) => n < 2);
console.log(single.length ? single.map(([t,n]) => t+': '+n).join('\n') : '없음');
"
```

Expected: 태그 페이지가 생성되고, 1편짜리 태그가 `없음`이어야 한다. 나오면 Task 6으로 돌아가 상위 개념으로 흡수한다.

- [ ] **Step 3: 커밋**

```bash
git add site/src/pages/tags
git commit -m "$(cat <<'EOF'
태그별 목록 페이지 추가

태그 페이지에서 아카이브의 필터 상태로 넘어가는 링크를 뒀다. 한 태그만
보다가 조건을 좁히고 싶을 때 자연스럽게 이어진다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: 랜딩 페이지

7초 안에 판단이 끝나는 화면이다. 대표 기록 카드에 제목만 넣지 않는 것이 핵심이다.

**Files:**
- Replace: `site/src/pages/index.astro`

**Interfaces:**
- Consumes: `posts` 컬렉션 (Task 6), `SERIES` (Task 3), `href` (Task 1)

- [ ] **Step 1: 구현**

`site/src/pages/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import PostCard from '../components/PostCard.astro';
import { href } from '../lib/href';

const posts = await getCollection('posts');

const featured = posts
  .filter((p) => p.data.featured)
  .sort((a, b) => a.data.date.localeCompare(b.data.date));

const recent = [...posts]
  .sort((a, b) => b.data.date.localeCompare(a.data.date))
  .slice(0, 6);

const counts = new Map<string, number>();
for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);

const stack = [...counts.entries()]
  .filter(([, n]) => n >= 2)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
  .slice(0, 12);

const NARRATIVE: Record<string, string> = {
  'order-server':
    '6개 도메인이 얽힌 커머스 주문을 멀티모듈로 분리하고, 내부/외부 통신과 트랜잭션 경계를 설계한 3부작',
};
---

<Base title="장현호 · Backend Developer" description="Kotlin과 Spring으로 서버를 만들며 남긴 기록 52편">
  <section class="hero">
    <p class="kicker">Backend Developer</p>
    <h1>장현호</h1>
    <p class="intro">
      Kotlin과 Spring으로 서버를 만들면서, 무엇을 왜 그렇게 결정했는지를 남겨 왔습니다.
      2024년부터 2025년까지의 기록 {posts.length}편입니다.
    </p>
    <p class="links"><a href="https://github.com/hyunolike" rel="me noopener">GitHub</a></p>
  </section>

  <section class="block">
    <h2>대표 기록</h2>
    <div class="featured">
      {featured.map((p) => (
        <a class="feature" href={href(`/posts/${p.data.slug}`)}>
          <p class="feature-meta">
            {p.data.series ? `시리즈 · ${posts.filter((q) => q.data.series === p.data.series).length}편` : p.data.category}
          </p>
          <h3>{p.data.title}</h3>
          <p class="feature-summary">
            {p.data.series && NARRATIVE[p.data.series] ? NARRATIVE[p.data.series] : p.data.summary}
          </p>
        </a>
      ))}
    </div>
  </section>

  <section class="block">
    <h2>다뤄본 기술</h2>
    <p class="hint">누르면 해당 기록만 모아 볼 수 있습니다.</p>
    <div class="stack">
      {stack.map(([name, n]) => (
        <a class="stack-item" href={href(`/archive?tags=${encodeURIComponent(name)}`)}>
          {name}<span class="n">{n}</span>
        </a>
      ))}
    </div>
  </section>

  <section class="block">
    <div class="block-head">
      <h2>최근 기록</h2>
      <a href={href('/archive')}>전체 {posts.length}편 보기 →</a>
    </div>
    <div class="grid">
      {recent.map((p) => (
        <PostCard
          slug={p.data.slug}
          title={p.data.title}
          summary={p.data.summary}
          date={p.data.date}
          category={p.data.category}
          tags={p.data.tags}
        />
      ))}
    </div>
  </section>

  <style>
    .hero { padding: 2rem 0 3rem; border-bottom: 1px solid var(--border); margin-bottom: 3rem; }
    .kicker { color: var(--accent); font-size: 0.875rem; font-weight: 600; margin: 0 0 0.4rem; letter-spacing: 0.02em; }
    .hero h1 { font-size: clamp(2rem, 7vw, 3rem); margin: 0 0 1rem; line-height: 1.15; }
    .intro { max-width: var(--measure); color: var(--text-dim); margin: 0 0 1.25rem; font-size: 1.05rem; }
    .links a { font-weight: 600; }

    .block { margin-bottom: 3.5rem; }
    .block h2 { font-size: 1.25rem; margin: 0 0 0.75rem; }
    .block-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
    .block-head h2 { margin: 0; }
    .block-head a { font-size: 0.875rem; white-space: nowrap; }
    .hint { color: var(--text-dim); font-size: 0.875rem; margin: 0 0 1rem; }

    .featured { display: grid; gap: 1rem; grid-template-columns: 1fr; }
    @media (min-width: 800px) { .featured { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .feature {
      display: block;
      padding: 1.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-raised);
      text-decoration: none;
      color: var(--text);
      transition: border-color 0.15s ease;
    }
    .feature:hover { border-color: var(--accent); }
    .feature-meta { color: var(--accent); font-size: 0.8rem; font-weight: 600; margin: 0 0 0.5rem; }
    .feature h3 { margin: 0 0 0.6rem; font-size: 1.1rem; line-height: 1.4; }
    .feature-summary { color: var(--text-dim); font-size: 0.9rem; margin: 0; line-height: 1.6; }

    .stack { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .stack-item {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.85rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-raised);
      text-decoration: none;
      color: var(--text);
      font-size: 0.9rem;
    }
    .stack-item:hover { border-color: var(--accent); color: var(--accent); }
    .stack-item .n { color: var(--text-dim); font-size: 0.8rem; font-variant-numeric: tabular-nums; }

    .grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
    @media (min-width: 700px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (min-width: 1100px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  </style>
</Base>
```

- [ ] **Step 2: 대표 기록이 4건인지 확인**

Run: `cd site && npm run build`

```bash
cd site && grep -c 'class="feature"' dist/index.html
```

Expected: `4`. 다르면 Task 6의 `featured: true` 지정을 확인한다.

- [ ] **Step 3: 화면 확인**

Run: `cd site && npm run preview`

`/dev-diary/`에서:

- 대표 기록 4장에 제목만이 아니라 서사 문장이 들어 있다
- 기술 뱃지를 누르면 `/dev-diary/archive?tags=Kotlin`으로 이동하고 필터가 걸린 상태로 뜬다
- 375px에서 가로 스크롤이 없다

- [ ] **Step 4: 커밋**

```bash
git add site/src/pages/index.astro
git commit -m "$(cat <<'EOF'
랜딩 페이지 구현

대표 기록 카드에 제목만 넣지 않고 무엇을 왜 그렇게 풀었는지 한 문장을 담았다.
평가자는 무엇을 했는지보다 어떻게 설명하는지를 본다.

기술 뱃지는 아카이브의 필터 상태로 링크한다. 스택을 나열하는 대신 눌러서
근거 글을 바로 확인하게 만드는 편이 설득력 있다. 2편 미만인 태그는 뺐다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: 링크 검사와 최종 검증

**Files:**
- Create: `site/scripts/check-links.mjs`
- Modify: `README.md` (사이트 링크 추가)

- [ ] **Step 1: 링크 체커 작성**

`site/scripts/check-links.mjs`:

```js
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', 'dist');
const BASE = '/dev-diary';

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function resolve(url) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean.startsWith(BASE)) return null;
  const rel = clean.slice(BASE.length).replace(/^\/+/, '');
  const candidates = [
    join(DIST, rel),
    join(DIST, rel, 'index.html'),
    join(DIST, `${rel}.html`),
  ];
  return candidates.some((c) => existsSync(c)) ? true : false;
}

const files = walk(DIST);
const problems = [];
let checked = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(DIST.length);

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|data:|#)/.test(url)) continue;

    checked += 1;

    if (!url.startsWith(BASE)) {
      problems.push(`${rel}: base 누락 → ${url}`);
      continue;
    }
    if (resolve(url) === false) {
      problems.push(`${rel}: 대상 없음 → ${url}`);
    }
  }

  if (html.includes('user-attachments')) {
    problems.push(`${rel}: 외부 이미지 참조가 남아 있음`);
  }
}

console.log(`HTML ${files.length}개 / 내부 링크 ${checked}개 검사`);

if (problems.length) {
  console.error(`\n문제 ${problems.length}건:`);
  for (const p of problems.slice(0, 50)) console.error(`  ${p}`);
  if (problems.length > 50) console.error(`  ... 외 ${problems.length - 50}건`);
  process.exit(1);
}

console.log('문제 없음');
```

- [ ] **Step 2: 실행**

Run: `cd site && npm run build && npm run check-links`
Expected: `문제 없음`

문제가 나오면 해당 파일에서 `href()`를 거치지 않은 링크를 찾아 고친다.

- [ ] **Step 3: 전체 테스트 실행**

Run: `cd site && npm test`
Expected: 모든 테스트 PASS (href 7, parse-date 9, corpus 1, tags 3, rehype 8, search-index 8 = 36)

- [ ] **Step 4: 페이지 수 검증**

```bash
cd site
echo -n "글: "; find dist/posts -name index.html | wc -l
echo -n "시리즈: "; find dist/series -name index.html | wc -l
echo -n "태그: "; find dist/tags -name index.html | wc -l
echo -n "랜딩: "; test -f dist/index.html && echo 1 || echo 0
echo -n "아카이브: "; test -f dist/archive/index.html && echo 1 || echo 0
echo -n "검색 인덱스: "; test -f dist/search-index.json && echo 1 || echo 0
```

Expected: 글 52 / 시리즈 4 / 태그는 실제 어휘 수 / 나머지 각 1

- [ ] **Step 5: Lighthouse 실행**

```bash
cd site && npm run preview &
sleep 4
npx lighthouse http://localhost:4321/dev-diary/ \
  --preset=perf --form-factor=mobile --screenEmulation.mobile \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=/tmp/lh-home.json --chrome-flags="--headless" --quiet
node -e "
const r = require('/tmp/lh-home.json');
for (const [k,v] of Object.entries(r.categories)) console.log(k, Math.round(v.score*100));
console.log('LCP', r.audits['largest-contentful-paint'].displayValue);
console.log('CLS', r.audits['cumulative-layout-shift'].displayValue);
"
kill %1
```

Expected: 4개 항목 모두 95 이상, LCP 2.5초 이하, CLS 0.1 이하.

글 상세 페이지도 같은 방식으로 확인한다 (이미지가 많아 가장 불리한 페이지).

```bash
npx lighthouse "http://localhost:4321/dev-diary/posts/주문-서버-개발기-2편-설계/" ...
```

95 미만이면 원인별 대응:
- LCP 초과 → 첫 화면 이미지에 `loading="eager"` + `fetchpriority="high"` 부여
- CLS 초과 → 매니페스트의 width/height가 실제와 다른 것. `fetch-images` 재실행
- Accessibility → 대비비 부족. `tokens.css`의 `--text-dim` 명도 조정

- [ ] **Step 6: 반응형 확인**

브라우저 개발자도구에서 375 / 768 / 1440px로 랜딩·아카이브·글 상세를 확인한다. 특히 표가 있는 글(`업무/SVN vs Git 작업 프로세스 비교`)과 이미지가 많은 글(`inner-circle/주문 서버 개발기 2편 (설계)`)에서 가로 스크롤이 없어야 한다.

- [ ] **Step 7: README에 사이트 링크 추가**

`README.md` 최상단 제목 바로 아래에 삽입한다.

```markdown
> ### 🌐 [아카이브 사이트에서 보기 →](https://hyunolike.github.io/dev-diary/)
> 52편의 기록을 검색·태그 필터로 탐색할 수 있습니다.
```

- [ ] **Step 8: 커밋**

```bash
cd /Users/hyuno/orca/dev-diary
git add site/scripts/check-links.mjs site/package.json README.md
git commit -m "$(cat <<'EOF'
링크 검사 스크립트 추가하고 README에 사이트 링크 연결

base가 /dev-diary라 링크에 base가 빠져도 로컬 dev 서버에서는 드러나지 않고
배포 후에만 404가 난다. 빌드 산출물을 직접 훑어 base 누락과 대상 없는 링크,
남아있는 외부 이미지 참조를 잡는다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 9: develop 병합과 배포**

```bash
cd /Users/hyuno/orca/dev-diary
git checkout develop
git merge --no-ff site/github-pages -m "$(cat <<'EOF'
dev-diary 아카이브 사이트 배포

기록 52편을 Astro 정적 사이트로 만들어 GitHub Pages에 배포한다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
git push origin develop
```

GitHub Actions 탭에서 워크플로가 성공하는지 확인한 뒤 `https://hyunolike.github.io/dev-diary/`를 연다.

- [ ] **Step 10: 배포본 최종 확인**

실제 배포 URL에서 확인한다. 로컬 preview와 달리 여기서만 드러나는 문제가 있다.

- 랜딩이 뜨고 대표 기록 4장이 보인다
- 기술 뱃지 클릭 → 아카이브로 이동하고 필터가 적용된다
- 검색창에 `레디스` 입력 시 결과가 즉시 좁혀진다
- 글 상세에서 이미지가 전부 보인다 (개발자도구 네트워크 탭에 `user-attachments` 요청 0건)
- 휴대폰에서 열어 가로 스크롤이 없는지 본다

---

## Self-Review

**스펙 커버리지**

| 스펙 절 | 담당 태스크 |
|---|---|
| 2. 목표·성공 기준 | Task 15 (Lighthouse, 링크, 반응형, 페이지 수) |
| 3. 비목표 | Global Constraints (노출 금지 목록) |
| 4. 기술 선택 | Task 1 (Astro 7) |
| 5. 정보 구조·랜딩 | Task 8, 10, 12, 13, 14 |
| 5. 대표 기록 4건 | Task 6 (featured 지정), Task 14 (서사 렌더) |
| 6. frontmatter·태그 어휘·시리즈 | Task 2, 3, 6 |
| 7. 검색 | Task 9, 10 |
| 8. 인터랙션 8종 | Task 7(다크모드·View Transitions), 8(TOC), 10(검색·필터), 11(타임라인), 12(시리즈 흐름), 14(스택 연동) |
| 9. 이미지 | Task 4, 5 |
| 10. 디자인 방향 | Task 7 |
| 11. 저장소 구조·서브모듈 정리 | Task 1 |
| 12. 배포 | Task 1, 15 |
| 13. 검증 | Task 15 |
| 14. 열린 항목 (GitLab) | 미포함 — 스펙대로 제외 |

**스펙 8절과의 차이**: 스펙은 인터랙션을 `client:idle` 등 Astro 아일랜드로 적었으나, 그러려면 UI 프레임워크 통합이 필요하다. "JS 거의 0" 목표에 맞춰 `.astro`의 순수 `<script>`로 구현한다. Astro가 자동으로 번들·defer하므로 정적 렌더 후 활성화라는 의도는 동일하게 달성된다.

**타입 일관성 확인**

- `href` / `joinBase` — Task 1에서 정의, 이후 전 태스크에서 동일 이름 사용
- `parsePostDate(markdown): string | null` — Task 2가 `src/lib/parse-date.mjs`에 정의, Task 6의 `scripts/scaffold-frontmatter.mjs`가 import. 로직은 한 곳에만 있다
- `TAGS` / `SERIES` — Task 3 정의, Task 6 스키마와 Task 12·14가 소비
- `image-manifest.json` 형태 `{ uuid: { width, height } }` — Task 4 생성, Task 5 소비
- `SearchRecord` 필드 7개 — Task 9 정의, Task 10의 `Record` 인터페이스와 일치
- `PostCard` props 6개 (`slug, title, summary, date, category, tags`) — Task 8 정의, Task 12·13·14가 동일하게 전달

**알려진 위험**

1. Task 6의 `tags`/`summary` 작성은 52편을 읽어야 하는 유일한 대량 수작업이다. 나머지 태스크보다 오래 걸린다
2. Task 4의 이미지 다운로드는 GitHub 응답에 의존한다. 원본이 삭제된 UUID가 있으면 해당 이미지는 복구 불가이며, 그 경우 Task 5의 빌드 실패 처리를 우회할 예외 목록이 필요해진다
3. Task 12의 시리즈 라벨 정규식은 "N편 (부제)" 패턴에만 맞는다. `svn`·`k8s`·`gstreamer-oss`는 전체 제목이 노출되므로 길면 `series.ts`에 라벨을 직접 적는 편이 낫다
