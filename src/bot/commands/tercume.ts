import type { CommandContext, Context } from 'grammy';
import { generateResponse } from '../../core/llm.js';
import { logger } from '../../lib/logger.js';

export async function tercumeCommand(ctx: CommandContext<Context>): Promise<void> {
  const input = (ctx.match ?? '').trim();

  if (!input) {
    await ctx.reply(
      '🔤 *Tərcümə*\n\n' +
      'İstifadə: `/tərcümə <mətn>`\n\n' +
      'Mətn Azərbaycan dilindədirsə ingilis dilinə, başqa dildədirsə Azərbaycan dilinə tərcümə edirəm.',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  await ctx.replyWithChatAction('typing');

  try {
    const result = await generateResponse({
      messages: [{
        role: 'user',
        content:
          `Aşağıdakı mətni tərcümə et. ` +
          `Əgər Azərbaycan dilindədirsə — ingilis dilinə, başqa dildədirsə — Azərbaycan dilinə. ` +
          `Yalnız tərcüməni ver, izahat vermə:\n\n${input}`,
      }],
    });
    await ctx.reply(`🔤 ${result.content}`);
  } catch (err) {
    logger.error('tercumeCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Tərcümə zamanı xəta baş verdi. Bir az sonra cəhd et.');
  }
}
