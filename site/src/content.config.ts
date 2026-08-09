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

const EXPECTED_POST_COUNT = 52;

export async function assertPostCount() {
  const { getCollection } = await import('astro:content');
  const posts = await getCollection('posts');
  if (posts.length !== EXPECTED_POST_COUNT) {
    throw new Error(
      `글 ${EXPECTED_POST_COUNT}편을 기대했으나 ${posts.length}편만 로드됐습니다. ` +
        `파일명에 #이 들어갔거나 frontmatter가 스키마를 통과하지 못했는지 확인하세요.`,
    );
  }
}
