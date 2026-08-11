import { visit } from 'unist-util-visit';

function textContent(node) {
  let text = '';
  visit(node, 'text', (t) => {
    text += t.value;
  });
  return text;
}

// 글 45편이 frontmatter title과 똑같은 문장으로 본문을 다시 여는 바람에
// <h1>제목</h1> 바로 뒤에 동일한 <h2>제목</h2>이 중복 표시되고, 그 중복
// 헤딩이 목차 첫 항목으로도 새어 들어갔다. 그중 1편(Jackson이 JSON
// 직렬화하는 방식)은 title과 같은 텍스트의 헤딩이 사이에 인용구를 끼고
// 두 번(h2, h3) 연달아 나온다 — 첫 번째만 지우면 두 번째가 그대로 남아
// 여전히 제목이 두 번 보였다.
//
// 그래서 "맨 앞 헤딩 하나"가 아니라 "맨 앞부터 시작하는, title과 일치하는
// 헤딩의 연속 구간"을 지운다. 본문 맨 앞(공백 텍스트 노드는 건너뛴 첫
// "엘리먼트다운" 노드)이 헤딩이 아니면 아무것도 하지 않는다 — 본문을
// 뒤지지 않는다. 첫 헤딩부터 문서 순서대로 헤딩만 훑으면서 title과
// 일치하는 동안 계속 지우고, 일치하지 않는 헤딩을 만나는 순간 멈춘다.
// 헤딩 사이에 낀 비헤딩 콘텐츠(인용구, 문단)는 구간을 끊지 않지만
// 그 자체는 건드리지 않는다. 안 맞는 헤딩 뒤에 다시 title과 같은
// 텍스트의 헤딩이 나와도 손대지 않는다 — 이 코퍼스에는 그런 글이
// 없는 것으로 확인됐지만, 있더라도 "hunt 안 함" 규칙을 지킨다.
export default function rehypeStripTitleHeading() {
  return (tree, file) => {
    const title = file?.data?.astro?.frontmatter?.title;
    if (typeof title !== 'string') return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const firstIndex = tree.children.findIndex(
      (node) => !(node.type === 'text' && node.value.trim() === ''),
    );
    if (firstIndex === -1) return;

    const first = tree.children[firstIndex];
    if (first.type !== 'element' || !/^h[1-6]$/.test(first.tagName)) return;

    const headings = tree.children
      .map((node, i) => ({ node, i }))
      .filter(({ node }) => node.type === 'element' && /^h[1-6]$/.test(node.tagName));

    const toRemove = [];
    for (const { node, i } of headings) {
      if (textContent(node).trim() !== trimmedTitle) break;
      toRemove.push(i);
    }

    for (const i of toRemove.reverse()) {
      tree.children.splice(i, 1);
    }
  };
}
