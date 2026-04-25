import type { CommandContext, Context } from 'grammy';
import { InputFile } from 'grammy';

export async function qrkodCommand(ctx: CommandContext<Context>): Promise<void> {
  const text = (ctx.match ?? '').trim();

  if (!text) {
    await ctx.reply(
      '📱 *QR kod generatoru*\n\nİstifadə: `/qrkod <mətn və ya link>`\n\nNümunə: `/qrkod https://t.me/guluzada_bot`',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  await ctx.replyWithChatAction('upload_photo');

  const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}&margin=20`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    await ctx.reply('QR kod yaradıla bilmədi. Bir az sonra cəhd et.');
    return;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await ctx.replyWithPhoto(new InputFile(buffer, 'qr.png'), {
    caption: `📱 QR kod: \`${text.length > 50 ? text.slice(0, 50) + '...' : text}\``,
    parse_mode: 'Markdown',
  });
}
