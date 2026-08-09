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
      node.properties.style = `max-width:min(${maxWidth}px,100%);height:auto`;
    });
  };
}
