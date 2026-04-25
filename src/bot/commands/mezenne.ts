import type { CommandContext, Context } from 'grammy';
import { getExchangeRates, formatRates } from '../../core/tools/exchange.js';
import { logger } from '../../lib/logger.js';

export async function mezenneCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.replyWithChatAction('typing');

  try {
    const rates = await getExchangeRates();
    const text =
      `💱 *CBAR Məzənnəsi*\n\n` +
      formatRates(rates) +
      `\n\n_Mənbə: cbar.az_`;
    await ctx.reply(text, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('mezenneCommand failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    await ctx.reply('Hal-hazırda məzənnəni əldə edə bilmirəm. Bir az sonra cəhd et.');
  }
}
