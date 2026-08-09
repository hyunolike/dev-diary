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
      // 따옴표 필수: 인용 없는 YAML 날짜는 Date 객체로 파싱되어 z.string()이 거부한다
      `date: "${date}"`,
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
