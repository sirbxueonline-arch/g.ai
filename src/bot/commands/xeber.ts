import type { CommandContext, Context } from 'grammy';
import { getLatestNews } from '../../core/tools/news.js';
import { logger } from '../../lib/logger.js';

export async function xeberCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.replyWithChatAction('typing');

  try {
    const items = await getLatestNews();
    if (items.length === 0) {
      await ctx.reply('Hal-hazırda xəbər tapılmadı.');
      return;
    }

    const lines = items.map((item, i) => `${i + 1}. [${item.title}](${item.link})`).join('\n\n');
    await ctx.reply(`📰 *Son xəbərlər*\n\n${lines}\n\n_Mənbə: AzərTAc_`, {
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    logger.error('xeberCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Xəbərləri əldə edə bilmədim. Bir az sonra cəhd et.');
  }
}
