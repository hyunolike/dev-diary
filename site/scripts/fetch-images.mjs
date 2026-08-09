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
