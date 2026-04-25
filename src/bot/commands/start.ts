import type { CommandContext, Context } from 'grammy';
import { mainMenu } from '../keyboard.js';
export { mainMenu };

export async function startCommand(ctx: CommandContext<Context>): Promise<void> {
  const name = ctx.from?.first_name ?? '';
  await ctx.reply(
    `Salam${name ? `, ${name}` : ''}! 👋\n\n` +
    `Mən Guluzada-yam — Azərbaycanlılar üçün hazırlanmış AI köməkçiyəm.\n\n` +
    `Məzənnə, hava, xəbər, tərcümə, kredit hesabı və daha çoxu — aşağıdakı menyudan seç ya da sadəcə yaz. Səs mesajı da qəbul edirəm. 🎙`,
    { reply_markup: mainMenu },
  );
}
