import type { CommandContext, Context } from 'grammy';
import { getExchangeRates, formatRates } from '../../core/tools/exchange.js';
import { logger } from '../../lib/logger.js';

const MONTHS: Record<number, string> = {
  1: 'yanvar', 2: 'fevral', 3: 'mart', 4: 'aprel',
  5: 'may', 6: 'iyun', 7: 'iyul', 8: 'avqust',
  9: 'sentyabr', 10: 'oktyabr', 11: 'noyabr', 12: 'dekabr',
};

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS[month ?? 1]} ${year}`;
}

export async function mezenneCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.replyWithChatAction('typing');

  try {
    const rates = await getExchangeRates();
    const text =
      `💱 *Valyuta məzənnəsi*\n\n` +
      formatRates(rates) +
      `\n\n_${formatDate(rates.updatedAt)} tarixinə_`;
    await ctx.reply(text, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('mezenneCommand failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    await ctx.reply('Hal-hazırda məzənnəni əldə edə bilmirəm. Bir az sonra cəhd et.');
  }
}
