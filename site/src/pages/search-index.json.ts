import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { toSearchRecord } from '../lib/search-index';

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const records = posts
    .map(toSearchRecord)
    .sort((a, b) => b.date.localeCompare(a.date));

  return new Response(JSON.stringify(records), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
