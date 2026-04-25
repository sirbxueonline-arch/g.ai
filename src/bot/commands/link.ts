import type { CommandContext, Context } from 'grammy';
import { logger } from '../../lib/logger.js';

export async function linkCommand(ctx: CommandContext<Context>): Promise<void> {
  const url = (ctx.match ?? '').trim();

  if (!url || !url.startsWith('http')) {
    await ctx.reply(
      '🔗 *URL qısaldıcı*\n\nİstifadə: `/link <url>`\n\nNümunə: `/link https://azerbaijani-long-url.com/some/path`',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  await ctx.replyWithChatAction('typing');

  try {
    const res = await fetch(
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(8000) },
    );
    const data = await res.json() as { shorturl?: string; errormessage?: string };

    if (data.shorturl) {
      await ctx.reply(`🔗 Qısaldılmış link:\n\`${data.shorturl}\``, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(`Xəta: ${data.errormessage ?? 'naməlum xəta'}`);
    }
  } catch (err) {
    logger.error('linkCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Linki qısalda bilmədim. Bir az sonra cəhd et.');
  }
}
