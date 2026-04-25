import { logger } from '../../lib/logger.js';

export interface ExchangeRates {
  usd: number;
  eur: number;
  rub: number;
  try: number;
  gbp: number;
  updatedAt: string;
}

// CBAR (Central Bank of Azerbaijan Republic) public XML feed
const CBAR_URL = 'https://www.cbar.az/currencies/today.xml';

export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch(CBAR_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`CBAR responded ${res.status}`);

    const xml = await res.text();
    const parse = (code: string): number => {
      const match = xml.match(new RegExp(`Code="${code}"[^>]*>([^<]+)`));
      return match?.[1] ? parseFloat(match[1]) : 0;
    };

    return {
      usd: parse('USD'),
      eur: parse('EUR'),
      rub: parse('RUB'),
      try: parse('TRY'),
      gbp: parse('GBP'),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    logger.error('Failed to fetch CBAR exchange rates', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export function formatRates(rates: ExchangeRates): string {
  return [
    `💵 1 USD = ${rates.usd.toFixed(4)} AZN`,
    `💶 1 EUR = ${rates.eur.toFixed(4)} AZN`,
    `🇷🇺 1 RUB = ${rates.rub.toFixed(4)} AZN`,
    `🇹🇷 1 TRY = ${rates.try.toFixed(4)} AZN`,
    `🇬🇧 1 GBP = ${rates.gbp.toFixed(4)} AZN`,
  ].join('\n');
}
