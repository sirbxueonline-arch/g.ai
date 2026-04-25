import type { CommandContext, Context } from 'grammy';
import { generateResponse } from '../../core/llm.js';
import { logger } from '../../lib/logger.js';

export async function sitatCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.replyWithChatAction('typing');
  try {
    const result = await generateResponse({
      messages: [{
        role: 'user',
        content:
          'Azərbaycan ədəbiyyatından, tarixindən və ya dünya mədəniyyətindən ' +
          'ilham verici bir sitat ver. Format:\n' +
          '*"Sitat"*\n— Ad, Soyad\n\n_Qısa izahat (1 cümlə)_\n\n' +
          'Yalnız bu formatda cavab ver.',
      }],
    });
    await ctx.reply(`🎯 *Günün sitatı*\n\n${result.content}`, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('sitatCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Sitatı əldə edə bilmədim. Bir az sonra cəhd et.');
  }
}
