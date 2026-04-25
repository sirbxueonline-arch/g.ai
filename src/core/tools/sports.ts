import { logger } from '../../lib/logger.js';

export type SportCategory = 'futbol' | 'basketbol' | 'güləş' | 'boks' | 'tenis' | 'digər';

const RSS_FEEDS: Record<SportCategory, string> = {
  futbol:    'https://sportinfo.az/rss/football',
  basketbol: 'https://sportinfo.az/rss/basketball',
  güləş:     'https://sportinfo.az/rss/wrestling',
  boks:      'https://sportinfo.az/rss/boxing',
  tenis:     'https://sportinfo.az/rss/tennis',
  digər:     'https://sportinfo.az/rss',
};

export interface SportNews {
  title: string;
  link: string;
}

function parseRSS(xml: string, limit = 5): SportNews[] {
  const items: SportNews[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1] ?? '';
    const title = (/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(block) ??
                   /<title>(.*?)<\/title>/.exec(block))?.[1]?.trim() ?? '';
    const link  = (/<link>(.*?)<\/link>/.exec(block))?.[1]?.trim() ?? '';
    if (title) items.push({ title, link });
  }
  return items;
}

export async function getSportNews(category: SportCategory): Promise<SportNews[]> {
  const url = RSS_FEEDS[category];
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Guluzada-Bot/1.0' },
    });
    if (!res.ok) throw new Error(`sportinfo.az responded ${res.status}`);
    return parseRSS(await res.text());
  } catch (err) {
    logger.error('getSportNews failed', { category, error: err instanceof Error ? err.message : String(err) });
    throw err;
  }
}
