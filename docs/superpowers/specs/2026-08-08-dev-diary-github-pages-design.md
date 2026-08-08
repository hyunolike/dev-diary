# dev-diary 아카이브 사이트 설계

> 작성일: 2026-08-08

## 1. 배경

`dev-diary` 저장소에는 2024~2025년에 쓴 기술 기록 53편이 7개 디렉터리에 흩어져 있다.
현재 유일한 진입점은 23KB짜리 `README.md`이며, URL 인코딩된 GitHub blob 링크를 수동으로
나열한 형태다. 검색·태그·시리즈 연결이 없고, 읽는 사람이 "이 저자가 무엇을 잘하는지"를
파악하려면 링크를 하나씩 눌러보는 수밖에 없다.

이 아카이브는 **더 이상 갱신하지 않는다.** 따라서 작성 편의(에디터 연동, 자동 배포 편의)는
설계 기준에서 제외하고, 완성도와 열람 경험에 자원을 몰아준다.

## 2. 목표

채용담당자가 사이트에 들어와 **7초 안에** 다음을 파악할 수 있어야 한다.

1. 이 사람은 어떤 개발자인가 (백엔드, Kotlin/Spring 중심)
2. 무엇을 깊게 파봤는가 (대표 기록 4건)
3. 어떤 기술을 실제로 다뤄봤는가 (스택 → 근거 글로 즉시 이동 가능)

그 다음 관심이 생긴 사람이 53편을 **검색·필터로 탐색**할 수 있어야 한다.

### 성공 기준

| 항목 | 기준 |
|---|---|
| Lighthouse (모바일) | Performance / Accessibility / Best Practices / SEO 각 95점 이상 |
| LCP | Slow 4G 시뮬레이션에서 2.5초 이내 |
| 반응형 | 375px 폭에서 가로 스크롤 0 |
| 콘텐츠 | 53편 전부 개별 페이지 존재, 내부 링크 깨짐 0건 |
| 이미지 | 187개 전부 자체 호스팅, 외부 요청 0건 |

## 3. 비목표

- 새 글 작성 워크플로 (아카이브는 동결)
- 댓글, 조회수, 애널리틱스
- 다국어
- RSS (갱신되지 않는 아카이브에는 의미 없음)
- 경력 연차·재직 회사 표기 — 정보를 받지 않았고 공개 사이트이므로 기재하지 않는다
- 이메일·GitLab·인프런 링크 — 노출하지 않기로 결정됨. GitHub 프로필만 노출한다

## 4. 기술 선택

**Astro 7.2.0** (2026-08-08 기준 최신 stable).

2026년 현재 콘텐츠 중심 정적 사이트의 사실상 표준이다. 2026년 1월 Cloudflare가 Astro를
인수해 장기 지속성이 확보됐고, 아일랜드 아키텍처 덕분에 "인터랙티브하지만 초기 로딩은
정적 사이트급"이라는 이 프로젝트의 요구를 그대로 만족한다.

검토했으나 채택하지 않은 대안:

| 대안 | 탈락 사유 |
|---|---|
| Jekyll | GitHub Pages 네이티브라 설정은 적지만 기성 테마가 전부 블로그 레이아웃. 랜딩을 직접 짜야 하는 시점에 Astro보다 불리하고 Ruby 의존이 부담 |
| Starlight / Fumadocs / Nextra | 제품 문서 프레임워크. 사이드바+본문 레이아웃이 고정이라 포트폴리오 랜딩을 얹기 어렵고 "남의 오픈소스 문서"처럼 보인다 |
| Next.js | 서버 전제 프레임워크. GitHub Pages에서 static export 제약을 받으며 정적 아카이브에 과잉 |
| 빌드 없는 정적 HTML 생성 | 파이프라인이 없어 단순하지만 수정할 때마다 재생성 스크립트를 돌려야 하고 디자인 반복이 불가능 |

## 5. 정보 구조

```
https://hyunolike.github.io/dev-diary/
├─ /                      랜딩
├─ /archive               전체 53편 · 검색 · 태그 필터 · 타임라인
├─ /posts/<slug>          글 상세
├─ /series/<slug>         시리즈 상세
└─ /tags/<tag>            태그별 목록
```

`<slug>`는 한글 제목을 그대로 URL 인코딩하지 않고, 영문 소문자 케밥 케이스로 새로 부여한다
(예: `주문 서버 개발기 2편 (설계)` → `order-server-2-design`). 슬러그는 frontmatter에
명시해 빌드마다 안정적으로 유지한다.

### 랜딩 구성

위에서부터 다음 순서로 배치한다.

1. **히어로** — `장현호 · Backend Developer`, 한 줄 소개, GitHub 프로필 링크
2. **대표 기록 4건** — 카드마다 제목 + `문제 → 판단 → 결과` 한 문장
3. **기술 스택** — 글에서 실제로 다룬 기술만. 각 뱃지는 클릭 가능하며 `/archive`로
   해당 태그가 적용된 상태로 이동한다
4. **아카이브 미리보기** — 최신 6편 + "전체 53편 보기"

대표 기록 카드에 제목만 넣지 않는 것이 이 설계의 핵심이다. 채용 시장 조사에 따르면
평가자는 "무엇을 했는지보다 어떻게 설명하는지"를 본다. 카드 자체가 의사결정 서사를
담아야 7초 안에 그 판단 능력이 전달된다.

### 대표 기록 4건 (확정)

| 기록 | 카드에 담을 서사 |
|---|---|
| 주문 서버 개발기 1~3편 | 6개 도메인이 얽힌 커머스 주문을 멀티모듈로 분리하고, 내부/외부 통신과 트랜잭션 경계를 설계한 3부작 |
| Swagger 개선기 | 문서화 코드가 컨트롤러를 오염시키는 문제를 커스텀 어노테이션과 인터페이스 분리 원칙으로 걷어낸 과정 |
| API 문서 자동화 | Spring REST Docs의 정확성과 Swagger UI의 열람성을 OAS 기반으로 합친 선택 |
| Kubernetes 운영 기록 4편 | CNI 플러그인 장애, Pod 네트워크 권한 문제, Finalizer 교착을 진단하고 해소한 기록과 그 과정에서 정리한 진단 명령어 |

## 6. 콘텐츠 파이프라인

원본 `.md` 53개는 **현재 위치를 그대로 유지한다.** GitHub에서 직접 읽던 기존 링크가
깨지지 않도록 하기 위함이다. 각 파일 상단에 frontmatter만 주입한다.

```
53개 .md (frontmatter 주입, 위치 유지)
   └→ Astro content collection (Zod 스키마 검증)
        ├→ 정적 HTML 페이지 (/posts/<slug>)
        └→ search-index.json
```

### frontmatter 스키마

```yaml
---
title: 주문 서버 개발기 2편 (설계)
slug: order-server-2-design
date: 2024-09-11
category: inner-circle
tags: [Kotlin, DDD, 멀티모듈, 트랜잭션]
series: order-server            # 선택
seriesOrder: 2                  # series가 있으면 필수
summary: 6개 도메인이 얽힌 주문을 멀티모듈로 나누고 내부/외부 통신 전략을 설계한 과정
featured: true                  # 기본 false
---
```

Zod 스키마로 검증하므로 오타나 필드 누락은 빌드 실패로 드러난다. 53개를 눈으로 검수할
필요가 없다.

`date`는 기존 본문의 `> 작성날짜: 24.09.11` 또는 `> 📅 탐구 일자: 2024-10-28` 줄에서
파싱한다. 해당 줄이 없는 글은 `git log --diff-filter=A --format=%aI -- <file>`로 얻은
최초 커밋 날짜를 쓴다.

`summary`는 글을 읽고 사람이 쓴다. 본문 첫 줄을 자르는 방식은 쓰지 않는다 — 상당수 글이
목차나 시리즈 안내로 시작해 요약으로 부적절하다.

### 태그 어휘 통제

태그는 자유 입력이 아니라 **사전에 정의된 어휘에서만** 고른다. 같은 개념이 `k8s`와
`Kubernetes`로 갈리면 필터가 무너지기 때문이다. Zod 스키마에 enum으로 못 박는다.

초기 어휘(글 53편을 읽고 확정하되, 아래를 출발점으로 한다):

- 언어/런타임: `Kotlin` `Java` `JavaScript`
- 프레임워크: `Spring Boot` `Spring Security` `JPA` `Vue`
- 인프라: `Kubernetes` `Docker` `AWS` `Linux`
- 데이터: `Redis` `Kafka` `RabbitMQ` `Oracle` `MySQL` `MongoDB` `SQLite`
- 설계: `DDD` `멀티모듈` `트랜잭션` `동시성` `아키텍처`
- 품질: `테스트` `API 문서화` `리팩터링`
- 도구/협업: `Git` `SVN` `Gradle` `CI/CD`

각 태그는 최소 2편 이상에 붙어야 한다. 1편짜리 태그는 필터로서 가치가 없으므로 상위
개념으로 흡수한다.

### 시리즈

`series`는 슬러그로 지정하고, 시리즈 메타데이터(표시 이름, 설명)는
`site/src/data/series.ts`에 별도 정의한다.

식별된 시리즈:

| 슬러그 | 표시 이름 | 편수 |
|---|---|---|
| `order-server` | 주문 서버 개발기 | 3 |
| `gstreamer-oss` | 오픈소스 GStreamer 기여기 | 3 |
| `svn` | SVN 실무 정리 | 5 |
| `k8s` | Kubernetes 운영 기록 | 4 |

## 7. 검색

검색 라이브러리를 쓰지 않는다. 빌드 시 `search-index.json`을 생성해 클라이언트가 통째로
내려받고, 부분 문자열 매칭으로 필터링한다.

근거: 본문 총량이 245KB에 불과해 gzip 후 80KB 수준이다. 그리고 Pagefind나 lunr 같은
토크나이저 기반 라이브러리는 한글 조사 문제를 겪는다 — "레디스를"로 검색하면 "레디스"가
든 글이 걸리지 않는다. 부분 문자열 매칭은 이 문제가 원천적으로 없다.

인덱스 필드: `slug`, `title`, `summary`, `tags`, `category`, `date`, `body`
(본문에서 코드 블록과 마크다운 문법을 제거한 평문).

검색과 태그 필터는 함께 동작한다. 태그가 선택된 상태에서 검색하면 교집합을 보여준다.

## 8. 인터랙션

Astro 아일랜드로 분리해, 페이지 본체는 정적 HTML로 즉시 렌더링되고 인터랙티브 부분만
개별적으로 활성화된다.

| 인터랙션 | 위치 | 아일랜드 여부 |
|---|---|---|
| 즉시 검색 (타이핑에 따라 필터링) | `/archive` | 예 (`client:idle`) |
| 태그 칩 다중 선택 필터 (교집합) | `/archive` | 예 (검색과 동일 아일랜드) |
| 기술 스택 뱃지 → 아카이브 태그 적용 이동 | `/` | 아니오 (링크로 충분) |
| 아카이브 타임라인 (2024~2025, 카테고리별 색) | `/archive` | 예 (`client:visible`) |
| 시리즈 흐름 다이어그램 (`도메인 → 설계 → 구현`) | `/`, `/series/<slug>` | 아니오 (정적 SVG + 링크) |
| 스크롤 연동 목차 | `/posts/<slug>` | 예 (`client:idle`) |
| View Transitions | 전역 | Astro 내장 |
| 다크모드 토글 | 전역 | 인라인 스크립트 (FOUC 방지) |

태그 필터 상태는 URL 쿼리(`/archive?tags=Kotlin,테스트`)에 반영한다. 랜딩의 스택 뱃지가
이 URL로 링크하면 JS 없이도 필터가 적용된 상태로 진입하며, 링크 공유도 가능해진다.

### 넣지 않을 것

스크롤 재킹, 패럴랙스, 3D 배경, 커서 추적 효과, 타이핑 애니메이션, 인트로 로딩 화면.
전부 초기 렌더를 지연시켜 LCP 기준과 충돌하고, 시각적으로도 낡은 인상을 준다.

## 9. 이미지

본문 이미지 187개가 전부 `https://github.com/user-attachments/assets/<uuid>` 형태다.
검증 결과 외부 사이트에서 로드는 가능하나(HTTP 200), 세 가지 문제가 있다.

1. 원본이 8192×1892 / 725KB PNG 수준으로 과대하다
2. 매 요청마다 S3 presigned URL로 302 리다이렉트가 발생해 왕복이 한 번 더 늘어난다
3. GitHub이 정책을 바꾸면 사이트 이미지가 통째로 죽는다

**전부 내려받아 자체 호스팅한다.**

- 저장 위치: `site/src/assets/posts/<uuid>.<ext>`
- 원본 `.md`에 가하는 변경은 6절의 frontmatter 주입뿐이며, 본문은 한 글자도 건드리지
  않는다. 이미지 URL도 그대로 둔다. remark 플러그인이 빌드 시
  `github.com/user-attachments/assets/<uuid>` 패턴을 로컬 asset으로 치환한다.
  UUID를 키로 매핑하므로 안정적이다
- Astro 이미지 최적화가 WebP 변환·리사이즈·`loading="lazy"`·명시적 width/height를 처리한다
  (width/height는 레이아웃 시프트 방지에 필요하며 Lighthouse 점수에 직결된다)
- 예상 용량: 원본 약 55MB → 8~15MB. GitHub Pages 한도 1GB에 여유가 크다

다운로드는 일회성 스크립트(`site/scripts/fetch-images.mjs`)로 수행하고, 받은 이미지는
저장소에 커밋한다. 빌드 때마다 네트워크에 의존하지 않기 위함이다.

원본 마크다운을 GitHub에서 직접 볼 때는 기존 외부 URL이 그대로 동작하므로 변화가 없다.

## 10. 디자인 방향

2026년 유행하는 글래스모피즘은 채택하지 않는다. 이미 충분히 흔해져 템플릿을 쓴 것처럼
보일 위험이 크다. 대신 **절제된 타이포그래피 중심**으로 간다.

- 본문 폰트: Pretendard (한글 가독성). 로컬 서브셋으로 self-host, `font-display: swap`
- 코드 폰트: JetBrains Mono
- 색: 무채색 기반에 액센트 1색. 카테고리별로는 색상 대신 라벨로 구분한다
  (7개 카테고리에 7색을 쓰면 산만해진다)
- 다크모드는 `prefers-color-scheme` 기본값 + 토글로 덮어쓰기
- 본문 최대 폭 약 70자 기준 — 긴 기술 글의 가독성이 목적
- 모바일 우선. 채용담당자 상당수가 휴대폰으로 첫 열람을 한다

## 11. 저장소 구조

사이트 코드는 `site/` 하위에 격리한다. 저장소 루트에 두면 글 디렉터리와 뒤섞인다.

```
dev-diary/
├─ inner-circle/ 개인/ 업무/ k8s/ oss/ ...   기존 글 (위치 유지, frontmatter만 추가)
├─ README.md                                  유지 (사이트 링크 추가)
├─ docs/superpowers/specs/                    설계 문서
├─ site/
│  ├─ astro.config.mjs
│  ├─ package.json / package-lock.json
│  ├─ scripts/fetch-images.mjs
│  └─ src/
│     ├─ content.config.ts                    컬렉션 정의 + Zod 스키마
│     ├─ data/series.ts
│     ├─ assets/posts/                        내려받은 이미지
│     ├─ components/ layouts/ pages/
│     └─ plugins/remark-local-images.mjs
└─ .github/workflows/deploy.yml
```

콘텐츠 컬렉션 로더는 저장소 루트의 글 디렉터리를 `../`로 참조한다.

### 정리할 것

`.gitmodules`에 `study.langchain` 서브모듈이 선언돼 있으나 디렉터리가 비어 있다.
CI 체크아웃에서 혼선을 줄 수 있으므로 제거한다.

## 12. 배포

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [develop]     # 이 저장소의 기본 브랜치
  workflow_dispatch:
```

`actions/checkout@v7` → `withastro/action@v6` (`path: ./site`) → `actions/deploy-pages@v5`.
`permissions`에 `contents: read`, `pages: write`, `id-token: write` 필요.

```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://hyunolike.github.io',
  base: '/dev-diary',
})
```

`base`가 루트가 아니므로 모든 내부 링크와 asset 경로에 `base`를 붙여야 한다. Astro의
`import.meta.env.BASE_URL`을 감싼 헬퍼를 하나 두고 링크는 전부 그것을 통과시킨다.
이 실수는 로컬에서는 드러나지 않고 배포 후에만 깨지므로, 빌드 산출물에 대한 링크 검사를
검증 단계에 포함한다.

저장소 Settings > Pages에서 소스를 "GitHub Actions"로 설정해야 한다 (수동 1회).

## 13. 검증

구현 완료 판정 전에 다음을 실제로 실행하고 출력을 확인한다.

1. `npm run build` 성공 — Zod 스키마 위반 0건
2. 빌드 산출물 링크 검사 — `dist/`를 대상으로 링크 체커를 돌려 내부 링크·이미지 경로
   깨짐 0건. `base` 누락은 배포 후에만 드러나므로 이 검사가 필수다
3. `npx lighthouse` 모바일 프로파일 — 4개 항목 95점 이상
4. 375px / 768px / 1440px 폭에서 가로 스크롤 없음 확인
5. `dist/`에 글 페이지 53개, 시리즈 페이지 4개, 랜딩·아카이브 각 1개가 생성됐는지 확인.
   태그 페이지는 최종 확정된 어휘 수와 일치해야 한다
6. 외부 이미지 요청 0건 (네트워크 탭에서 `user-attachments` 호출 없음)

## 14. 열린 항목

**GitLab 실습 자료 노출 여부.** README에 예약 대기열 시스템, 선착순 티켓 구매, API 통합
시스템 등 실습 프로젝트 5건이 GitLab 링크로 걸려 있다. 채용 시장 조사에서 평가자가
"실제 프로젝트와 결과물"을 가장 먼저 본다고 나온 만큼, 글 53편보다 강한 소재일 수 있다.
현재는 링크 노출 대상에서 제외하기로 결정돼 설계에 포함하지 않았다. 마음이 바뀌면
랜딩에 "실습 프로젝트" 블록을 추가하는 것으로 대응한다 — 구조 변경 없이 가능하다.
