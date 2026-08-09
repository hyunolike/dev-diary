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

// <pre>/<code> 안 텍스트는 링크가 아니다. 예제 코드에 `href="..."`처럼 보이는
// 문자열이 그대로 등장할 수 있는데, 실제 링크는 코드 블록 안에 살지 않으므로
// 속성 스캔 전에 이 영역을 통째로 잘라내도 진짜 링크를 놓칠 위험은 없다.
function stripCode(html) {
  return html.replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
}

const files = walk(DIST);
const problems = [];
let checked = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(DIST.length);
  const scanned = stripCode(html);

  for (const m of scanned.matchAll(/(?:href|src)="([^"]+)"/g)) {
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
