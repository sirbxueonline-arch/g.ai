import type { CommandContext, Context } from 'grammy';
import { mainMenu } from '../keyboard.js';

export async function startCommand(ctx: CommandContext<Context>): Promise<void> {
  const name = ctx.from?.first_name ?? 'Salam';
  await ctx.reply(
    `Salam, ${name}! 👋\n\n` +
    `Mən Guluzada-yam — Azərbaycanlılar üçün köməkçi.\n\n` +
    `Aşağıdakı menyudan seç və ya sadəcə yaz!`,
    { reply_markup: mainMenu },
  );
}
