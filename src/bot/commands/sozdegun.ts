import type { CommandContext, Context } from 'grammy';
import { generateResponse } from '../../core/llm.js';
import { logger } from '../../lib/logger.js';

export async function sozdəgunCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.replyWithChatAction('typing');
  try {
    const result = await generateResponse({
      messages: [{
        role: 'user',
        content:
          'Azərbaycan dilindən maraqlı, az tanınan və ya arxaik bir söz seç. ' +
          'Formatı: \n*Söz:* ...\n*Mənası:* ...\n*Cümlə nümunəsi:* ...\n*Maraqlı fakt:* ... ' +
          'Yalnız bu formatda cavab ver, başqa heç nə əlavə etmə.',
      }],
    });
    await ctx.reply(`💡 *Günün sözü*\n\n${result.content}`, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('sozdəgunCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Günün sözünü əldə edə bilmədim. Bir az sonra cəhd et.');
  }
}
