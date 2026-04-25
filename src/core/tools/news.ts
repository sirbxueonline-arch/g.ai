import { logger } from '../../lib/logger.js';

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

// AzərTAc official RSS
const RSS_URL = 'https://azertag.az/rss';

function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
    const block = match[1] ?? '';
    const title = (/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(block) ??
                   /<title>(.*?)<\/title>/.exec(block))?.[1]?.trim() ?? '';
    const link  = (/<link>(.*?)<\/link>/.exec(block))?.[1]?.trim() ?? '';
    const date  = (/<pubDate>(.*?)<\/pubDate>/.exec(block))?.[1]?.trim() ?? '';
    if (title) items.push({ title, link, pubDate: date });
  }
  return items;
}

export async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(RSS_URL, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Guluzada-Bot/1.0' },
    });
    if (!res.ok) throw new Error(`AzərTAc RSS responded ${res.status}`);
    const xml = await res.text();
    return parseRSS(xml);
  } catch (err) {
    logger.error('Failed to fetch news', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
