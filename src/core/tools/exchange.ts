import { logger } from '../../lib/logger.js';

export interface ExchangeRates {
  usd: number;
  eur: number;
  rub: number;
  try: number;
  gbp: number;
  updatedAt: string;
}

interface ERApiResponse {
  rates: Record<string, number>;
  date: string;
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`ExchangeRate API responded ${res.status}`);

    const data = await res.json() as ERApiResponse;
    const r = data.rates;

    // All rates are relative to USD. AZN/X gives "1 X = ? AZN"
    const azn = r['AZN'] ?? 1.7;
    const toAZN = (code: string) => azn / (r[code] ?? 1);

    return {
      usd: azn,
      eur: toAZN('EUR'),
      rub: toAZN('RUB'),
      try: toAZN('TRY'),
      gbp: toAZN('GBP'),
      updatedAt: data.date,
    };
  } catch (err) {
    logger.error('Failed to fetch exchange rates', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export function formatRates(rates: ExchangeRates): string {
  return [
    `🇺🇸 1 USD = ${rates.usd.toFixed(4)} ₼`,
    `🇪🇺 1 EUR = ${rates.eur.toFixed(4)} ₼`,
    `🇷🇺 1 RUB = ${rates.rub.toFixed(4)} ₼`,
    `🇹🇷 1 TRY = ${rates.try.toFixed(4)} ₼`,
    `🇬🇧 1 GBP = ${rates.gbp.toFixed(4)} ₼`,
  ].join('\n');
}
