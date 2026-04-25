import type { CommandContext, Context } from 'grammy';
import { generateResponse } from '../../core/llm.js';
import { logger } from '../../lib/logger.js';

export async function imtahanCommand(ctx: CommandContext<Context>): Promise<void> {
  const question = (ctx.match ?? '').trim();

  if (!question) {
    await ctx.reply(
      '🎓 *İmtahan köməkçisi*\n\n' +
      'Azərbaycan universitetlərinə qəbul, DİM imtahanları, ' +
      'ixtisas seçimi və hazırlıq haqqında sual ver.\n\n' +
      'Nümunə: `/imtahan riyaziyyatdan 400 bal yığmaq üçün hansı mövzulara fokuslanmalıyam`',
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
          `Sən Azərbaycan təhsil sistemi üzrə mütəxəssisləsən — DİM, qəbul imtahanları, ` +
          `ixtisaslar, universitetlər. Aşağıdakı suala praktiki, konkret məsləhət ver:\n\n${question}`,
      }],
    });
    await ctx.reply(`🎓 ${result.content}`, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('imtahanCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Cavab verə bilmədim. Bir az sonra cəhd et.');
  }
}
