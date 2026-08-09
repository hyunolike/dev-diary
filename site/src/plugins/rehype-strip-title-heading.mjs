import { visit } from 'unist-util-visit';

function textContent(node) {
  let text = '';
  visit(node, 'text', (t) => {
    text += t.value;
  });
  return text;
}

// 글 41편이 frontmatter title과 똑같은 문장으로 본문을 다시 여는 바람에
// <h1>제목</h1> 바로 뒤에 동일한 <h2>제목</h2>이 중복 표시되고, 그 중복
// 헤딩이 목차 첫 항목으로도 새어 들어갔다. 본문 맨 앞(공백 텍스트 노드는
// 건너뛴 첫 번째 "엘리먼트다운" 노드)이 헤딩이고 그 텍스트가 frontmatter
// title과 정확히 일치할 때만 제거한다. 본문 중간에 같은 텍스트의 헤딩이
// 또 있어도 건드리지 않는다 — 첫머리만 본다.
export default function rehypeStripTitleHeading() {
  return (tree, file) => {
    const title = file?.data?.astro?.frontmatter?.title;
    if (typeof title !== 'string') return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const index = tree.children.findIndex(
      (node) => !(node.type === 'text' && node.value.trim() === ''),
    );
    if (index === -1) return;

    const first = tree.children[index];
    if (first.type !== 'element' || !/^h[1-6]$/.test(first.tagName)) return;

    if (textContent(first).trim() === trimmedTitle) {
      tree.children.splice(index, 1);
    }
  };
}
