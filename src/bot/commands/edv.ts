import type { CommandContext, Context } from 'grammy';

const VAT_RATE = 0.18;

export async function edvCommand(ctx: CommandContext<Context>): Promise<void> {
  const args = (ctx.match ?? '').trim().split(/\s+/);
  const amount = parseFloat(args[0] ?? '');
  const mode   = (args[1] ?? 'add').toLowerCase(); // add | remove

  if (isNaN(amount) || amount <= 0) {
    await ctx.reply(
      '🧮 *ƏDV kalkulatoru (18%)*\n\n' +
      '`/edv 100` — 100 ₼-ə ƏDV əlavə et\n' +
      '`/edv 118 remove` — 118 ₼-dən ƏDV çıxart',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  if (mode === 'remove' || mode === 'çıxar') {
    const base = amount / (1 + VAT_RATE);
    const vat  = amount - base;
    await ctx.reply(
      `🧮 *ƏDV çıxarma*\n\n` +
      `ƏDV daxil məbləğ: ${amount.toFixed(2)} ₼\n` +
      `ƏDV-siz məbləğ: *${base.toFixed(2)} ₼*\n` +
      `ƏDV məbləği: ${vat.toFixed(2)} ₼`,
      { parse_mode: 'Markdown' },
    );
  } else {
    const vat   = amount * VAT_RATE;
    const total = amount + vat;
    await ctx.reply(
      `🧮 *ƏDV əlavəsi*\n\n` +
      `ƏDV-siz məbləğ: ${amount.toFixed(2)} ₼\n` +
      `ƏDV (18%): ${vat.toFixed(2)} ₼\n` +
      `Ümumi məbləğ: *${total.toFixed(2)} ₼*`,
      { parse_mode: 'Markdown' },
    );
  }
}
