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
