import type { CommandContext, Context } from 'grammy';
import { getOnThisDayEvents } from '../../core/tools/history.js';
import { generateResponse } from '../../core/llm.js';
import { logger } from '../../lib/logger.js';

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

    const eventLines = events
      .map(e => `- ${e.year}: ${e.text}`)
      .join('\n');

    const result = await generateResponse({
      messages: [
        {
          role: 'user',
          content:
            `Bu gün ${day}.${month}. Aşağıdakı tarix hadisələrini Azərbaycan dilində təqdim et. ` +
            `Hər hadisəni bir-iki cümlə ilə aydın, maraqlı şəkildə yaz. ` +
            `Format: il — izahat. Hadisələr:\n${eventLines}`,
        },
      ],
    });

    await ctx.reply(`📅 *Bu gün tarixdə — ${day}.${month}*\n\n${result.content}`, {
      parse_mode: 'Markdown',
    });
  } catch (err) {
    logger.error('historyCommand failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    await ctx.reply('Tarix məlumatını əldə edə bilmədim. Bir az sonra cəhd et.');
  }
}
