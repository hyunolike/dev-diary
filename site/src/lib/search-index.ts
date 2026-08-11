export interface SearchRecord {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  date: string;
  body: string;
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toSearchRecord(entry: {
  body?: string;
  data: {
    slug: string;
    title: string;
    summary: string;
    tags: string[];
    category: string;
    date: string;
  };
}): SearchRecord {
  return {
    slug: entry.data.slug,
    title: entry.data.title,
    summary: entry.data.summary,
    tags: entry.data.tags,
    category: entry.data.category,
    date: entry.data.date,
    body: stripMarkdown(entry.body ?? ''),
  };
}
