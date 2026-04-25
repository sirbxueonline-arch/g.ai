import type { CommandContext, Context } from 'grammy';
import { generateResponse } from '../../core/llm.js';
import { logger } from '../../lib/logger.js';

export async function ozellerCommand(ctx: CommandContext<Context>): Promise<void> {
  const text = (ctx.match ?? '').trim();

  if (!text) {
    await ctx.reply(
      '📝 *Mətni xülasələ*\n\n' +
      'Xülasə etmək istədiyin mətni komandanın ardından yaz:\n\n' +
      '`/özəllər <mətn>`',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  if (text.length < 100) {
    await ctx.reply('Mətn çox qısadır. Ən azı 100 simvol olan mətn göndər.');
    return;
  }

  await ctx.replyWithChatAction('typing');

  try {
    const result = await generateResponse({
      messages: [{
        role: 'user',
        content: `Aşağıdakı mətni Azərbaycan dilində qısa və aydın şəkildə xülasələ. ` +
                 `Əsas fikirləri 3-5 bənddə ver:\n\n${text}`,
      }],
    });
    await ctx.reply(`📝 *Xülasə*\n\n${result.content}`, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('ozellerCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Xülaslə zamanı xəta baş verdi. Bir az sonra cəhd et.');
  }
}
