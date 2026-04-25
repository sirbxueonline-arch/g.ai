import type { CommandContext, Context } from 'grammy';
import { getSportNews, type SportCategory } from '../../core/tools/sports.js';
import { logger } from '../../lib/logger.js';

const EMOJIS: Record<SportCategory, string> = {
  futbol:    '⚽',
  basketbol: '🏀',
  güləş:     '🤼',
  boks:      '🥊',
  tenis:     '🎾',
  digər:     '🏅',
};

export async function idmanCommand(ctx: CommandContext<Context>): Promise<void> {
  const sport = (ctx.match ?? '').trim().toLowerCase() as SportCategory;

  if (!sport || !Object.keys(EMOJIS).includes(sport)) {
    // Show sport selection menu
    await ctx.reply(
      '⚽ *İdman xəbərləri — kateqoriya seç:*\n\n' +
      '`/idman futbol`\n' +
      '`/idman basketbol`\n' +
      '`/idman güləş`\n' +
      '`/idman boks`\n' +
      '`/idman tenis`\n' +
      '`/idman digər`',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  await ctx.replyWithChatAction('typing');

  try {
    const news = await getSportNews(sport);
    if (news.length === 0) {
      await ctx.reply('Bu kateqoriyada xəbər tapılmadı.');
      return;
    }
    const emoji = EMOJIS[sport];
    const lines = news.map((n, i) => `${i + 1}. [${n.title}](${n.link})`).join('\n\n');
    await ctx.reply(
      `${emoji} *${sport.charAt(0).toUpperCase() + sport.slice(1)} xəbərləri*\n\n${lines}`,
      { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } },
    );
  } catch (err) {
    logger.error('idmanCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('İdman xəbərlərini əldə edə bilmədim. Bir az sonra cəhd et.');
  }
}
