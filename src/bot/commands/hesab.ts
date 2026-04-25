import type { CommandContext, Context } from 'grammy';

const SAFE_EXPR = /^[\d\s+\-*/.()^%,]+$/;

function safeEval(expr: string): number {
  // Replace ^ with ** and commas with dots
  const clean = expr.replace(/\^/g, '**').replace(/,/g, '.');
  if (!SAFE_EXPR.test(clean)) throw new Error('unsafe');
  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${clean})`)() as unknown;
  if (typeof result !== 'number' || !isFinite(result)) throw new Error('invalid');
  return result;
}

export async function hesabCommand(ctx: CommandContext<Context>): Promise<void> {
  const expr = (ctx.match ?? '').trim();

  if (!expr) {
    await ctx.reply(
      '🔢 *Kalkulyator*\n\n' +
      'İstifadə: `/hesab <ifadə>`\n\n' +
      'Nümunələr:\n' +
      '`/hesab 25 * 4 + 10`\n' +
      '`/hesab (100 - 30) / 7`\n' +
      '`/hesab 2^10`',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  try {
    const result = safeEval(expr);
    const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(6).replace(/\.?0+$/, '');
    await ctx.reply(`🔢 \`${expr}\` = *${formatted}*`, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('Düstur düzgün deyil. Nümunə: `/hesab 25 * 4 + 10`', { parse_mode: 'Markdown' });
  }
}
