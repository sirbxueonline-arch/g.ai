import type { CommandContext, Context } from 'grammy';
import { getOnThisDayEvents } from '../../core/tools/history.js';
import { logger } from '../../lib/logger.js';

const MONTHS: Record<number, string> = {
  1: 'yanvar', 2: 'fevral', 3: 'mart', 4: 'aprel',
  5: 'may', 6: 'iyun', 7: 'iyul', 8: 'avqust',
  9: 'sentyabr', 10: 'oktyabr', 11: 'noyabr', 12: 'dekabr',
};

export async function historyCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.replyWithChatAction('typing');

  try {
    const events = await getOnThisDayEvents();
    if (events.length === 0) {
      await ctx.reply('Bu gün üçün tarix hadisəsi tapılmadı.');
      return;
    }

    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const monthName = MONTHS[month] ?? '';

    const lines = events.map(e => `• *${e.year}* — ${e.text}`).join('\n\n');

    await ctx.reply(`📅 *${day} ${monthName} — tarixdə bu gün*\n\n${lines}`, {
      parse_mode: 'Markdown',
    });
  } catch (err) {
    logger.error('historyCommand failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    await ctx.reply('Tarix məlumatını əldə edə bilmədim. Bir az sonra cəhd et.');
  }
}
