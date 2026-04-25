import type { CommandContext, Context } from 'grammy';

export async function senedCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.reply(
    '📄 *Sənəd izahı*\n\n' +
    'Rəsmi sənədin şəklini göndər (foto kimi, fayl kimi deyil) — ' +
    'mən onu oxuyub sadə Azərbaycanca izah edəcəm.\n\n' +
    '_Nümunə: arayış, müqavilə, bildiriş, vergi sənədi, ASAN arayışı..._',
    { parse_mode: 'Markdown' },
  );
}
