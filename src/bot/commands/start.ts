import type { CommandContext, Context } from 'grammy';

export async function startCommand(ctx: CommandContext<Context>): Promise<void> {
  const name = ctx.from?.first_name ?? 'Salam';
  await ctx.reply(
    `Salam, ${name}! 👋\n\n` +
    `Mən Guluzada-yam — Azərbaycanlılar üçün hazırlanmış köməkçi.\n\n` +
    `Nə edə bilərəm:\n` +
    `• Hər cür sualına cavab verəm\n` +
    `• 🎙 Səs mesajlarını qəbul edirəm\n` +
    `• 💵 /məzənnə — CBAR valyuta kursları\n` +
    `• 🌤 /hava — Bakı hava proqnozu\n` +
    `• 📄 /sənəd — Rəsmi sənədi izah edim\n` +
    `• 📅 /history — Bu gün tarixdə\n\n` +
    `Yaz və ya səs mesajı göndər!`,
  );
}
