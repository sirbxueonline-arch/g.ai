import { logger } from '../../lib/logger.js';

export interface HistoryEvent {
  year: number;
  text: string;
}

interface WikiEvent {
  year: number;
  text: string;
}

interface WikiResponse {
  events?: WikiEvent[];
}

export async function getOnThisDayEvents(): Promise<HistoryEvent[]> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`Wikipedia responded ${res.status}`);

    const data = await res.json() as WikiResponse;
    const events = data.events ?? [];

    // Pick up to 5 events spread across different centuries
    const picked: WikiEvent[] = [];
    const seen = new Set<number>();
    for (const ev of events) {
      const century = Math.floor(ev.year / 100);
      if (!seen.has(century)) {
        seen.add(century);
        picked.push(ev);
      }
      if (picked.length >= 5) break;
    }

    return picked.map(e => ({ year: e.year, text: e.text }));
  } catch (err) {
    logger.error('Failed to fetch history events', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
