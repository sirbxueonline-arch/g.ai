import type { CommandContext, Context } from 'grammy';

// SOCAR regulated prices (Azerbaijan government fixed prices, updated manually)
const PRICES = [
  { name: 'AI-92', price: '1.00 ₼/L' },
  { name: 'AI-95', price: '1.20 ₼/L' },
  { name: 'AI-98', price: '1.50 ₼/L' },
  { name: 'Dizel', price: '1.00 ₼/L' },
  { name: 'Maye qaz (LPG)', price: '0.40 ₼/L' },
];

export async function yanacaqCommand(ctx: CommandContext<Context>): Promise<void> {
  const lines = PRICES.map(p => `⛽ ${p.name} — *${p.price}*`).join('\n');
  await ctx.reply(
    `⛽ *Azərbaycanda yanacaq qiymətləri*\n\n${lines}\n\n_Mənbə: SOCAR (dövlət tənzimlənməsi)_`,
    { parse_mode: 'Markdown' },
  );
}
