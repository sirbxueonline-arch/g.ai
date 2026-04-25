import type { CommandContext, Context } from 'grammy';
import { getExchangeRates } from '../../core/tools/exchange.js';
import { logger } from '../../lib/logger.js';

const ALIASES: Record<string, string> = {
  dollar: 'USD', dollars: 'USD', usd: 'USD', '$': 'USD',
  manat: 'AZN', azn: 'AZN', '₼': 'AZN',
  euro: 'EUR', evro: 'EUR', eur: 'EUR', '€': 'EUR',
  rubl: 'RUB', rub: 'RUB',
  lira: 'TRY', try: 'TRY',
  funt: 'GBP', gbp: 'GBP', '£': 'GBP',
};

function resolveCode(raw: string): string | null {
  return ALIASES[raw.toLowerCase()] ?? null;
}

export async function konvertCommand(ctx: CommandContext<Context>): Promise<void> {
  const args = (ctx.match ?? '').trim().split(/\s+/);
  // Accepts: /konvert 100 usd   or   /konvert 100 dollar azn
  const amount = parseFloat(args[0] ?? '');
  const fromRaw = args[1] ?? '';
  const toRaw = args[2] ?? 'AZN';

  if (isNaN(amount) || !fromRaw) {
    await ctx.reply(
      'İstifadə: `/konvert 100 usd` və ya `/konvert 50 manat dollar`',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  const from = resolveCode(fromRaw) ?? fromRaw.toUpperCase();
  const to   = resolveCode(toRaw)   ?? toRaw.toUpperCase();

  await ctx.replyWithChatAction('typing');

  try {
    const rates = await getExchangeRates();
    // Build AZN-centric rate map
    const inAZN: Record<string, number> = {
      AZN: 1,
      USD: rates.usd,
      EUR: rates.eur,
      RUB: rates.rub,
      TRY: rates.try,
      GBP: rates.gbp,
    };

    const fromRate = inAZN[from];
    const toRate   = inAZN[to];

    if (!fromRate || !toRate) {
      await ctx.reply(`"${from}" və ya "${to}" valyutasını tanımadım.`);
      return;
    }

    const result = (amount * fromRate) / toRate;
    await ctx.reply(
      `💱 ${amount} ${from} = *${result.toFixed(4)} ${to}*`,
      { parse_mode: 'Markdown' },
    );
  } catch (err) {
    logger.error('konvertCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Çevirmə zamanı xəta baş verdi. Bir az sonra cəhd et.');
  }
}
