import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const SRC = join(HERE, '..', 'src');
const FONT_DIR = join(SRC, 'assets', 'fonts');

const POST_DIRS = ['개인', 'inner-circle', '업무', 'k8s', 'oss', '기업-기술-블로그-탐구-일지', '오픈소스-프로젝트-분석-일지'];
const SRC_EXTENSIONS = new Set(['.astro', '.ts', '.mjs', '.css']);

// 인쇄 가능한 아스키 전체를 바닥으로 깐다 (공백~물결표).
const ASCII_FLOOR = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCharCode(0x20 + i)).join('');

// astro.config.mjs의 markdown 파이프라인은 remark-smartypants를 기본값(모든 옵션 true)으로
// 돌린다. 이 플러그인은 .md 원문의 "..." / "--" / 스트레이트 따옴표를 빌드 타임에
// 타이포그래피 문자로 바꿔치기한다 — 즉 이 문자들은 소스 어디에도 리터럴로 존재하지
// 않고 렌더링된 HTML에만 나타난다. 소스 스캔만으로는 못 잡으므로 고정 목록으로 깐다.
// (retext-smartypants 기본 동작: quotesDefault, ellipsesDefault, backticksDefault,
// dashesDefault — oldschool/inverted가 아니므로 en dash는 생성되지 않는다.)
const SMARTYPANTS_FLOOR = '“”‘’…—'; // “ ” ‘ ’ … —

function walk(dir, onFile) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.astro') continue;
      walk(full, onFile);
    } else {
      onFile(full);
    }
  }
}

function collectPostChars() {
  const chars = new Set();
  for (const dir of POST_DIRS) {
    for (const file of readdirSync(join(ROOT, dir))) {
      if (!file.endsWith('.md')) continue;
      // 파일명도 렌더링 대상이다 (슬러그가 아니라 카드 제목/링크 텍스트로 쓰이는 문자가 있을 수 있으므로 방어적으로 포함).
      for (const ch of file) chars.add(ch);
      const content = readFileSync(join(ROOT, dir, file), 'utf8');
      for (const ch of content) chars.add(ch);
    }
  }
  return chars;
}

function collectSrcChars() {
  const chars = new Set();
  walk(SRC, (file) => {
    if (!SRC_EXTENSIONS.has(extname(file))) return;
    const content = readFileSync(file, 'utf8');
    for (const ch of content) chars.add(ch);
  });
  return chars;
}

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  const postChars = collectPostChars();
  const srcChars = collectSrcChars();

  const allChars = new Set([...postChars, ...srcChars, ...ASCII_FLOOR, ...SMARTYPANTS_FLOOR]);
  const text = [...allChars].join('');

  console.log(`수집한 고유 문자 수: ${allChars.size}`);

  // Pretendard: 본문·UI 전체에서 쓰는 문자 집합 + wght 축을 400–700으로 제한.
  const pretendardPath = join(FONT_DIR, 'PretendardVariable.woff2');
  const pretendardBefore = readFileSync(pretendardPath);
  const pretendardAfter = await subsetFont(pretendardBefore, text, {
    targetFormat: 'woff2',
    variationAxes: {
      wght: { min: 400, max: 700 },
    },
  });
  writeFileSync(pretendardPath, pretendardAfter);
  console.log(
    `PretendardVariable.woff2: ${fmtKB(pretendardBefore.length)} → ${fmtKB(pretendardAfter.length)} ` +
      `(${(100 - (pretendardAfter.length / pretendardBefore.length) * 100).toFixed(1)}% 감소)`,
  );

  // JetBrains Mono: 코드 블록에서만 쓰이므로 인쇄 가능 아스키만 있으면 충분하다.
  const jbMonoPath = join(FONT_DIR, 'JetBrainsMono.woff2');
  const jbMonoBefore = readFileSync(jbMonoPath);
  const jbMonoAfter = await subsetFont(jbMonoBefore, ASCII_FLOOR, {
    targetFormat: 'woff2',
  });
  writeFileSync(jbMonoPath, jbMonoAfter);
  console.log(
    `JetBrainsMono.woff2: ${fmtKB(jbMonoBefore.length)} → ${fmtKB(jbMonoAfter.length)} ` +
      `(${(100 - (jbMonoAfter.length / jbMonoBefore.length) * 100).toFixed(1)}% 감소)`,
  );
}

main();
