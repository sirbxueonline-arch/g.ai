import type { CommandContext, Context } from 'grammy';

type ConvEntry = { to: string; factor: number };
const CONVERSIONS: Record<string, ConvEntry[]> = {
  km:   [{ to: 'mil', factor: 0.621371 }, { to: 'm', factor: 1000 }],
  mil:  [{ to: 'km', factor: 1.60934 }],
  m:    [{ to: 'km', factor: 0.001 }, { to: 'fut', factor: 3.28084 }, { to: 'sm', factor: 100 }],
  sm:   [{ to: 'm', factor: 0.01 }, { to: 'düym', factor: 0.393701 }],
  kq:   [{ to: 'funt', factor: 2.20462 }, { to: 'q', factor: 1000 }],
  funt: [{ to: 'kq', factor: 0.453592 }],
  q:    [{ to: 'kq', factor: 0.001 }],
  l:    [{ to: 'qalon', factor: 0.264172 }, { to: 'ml', factor: 1000 }],
  ml:   [{ to: 'l', factor: 0.001 }],
  ha:   [{ to: 'dönüm', factor: 10 }, { to: 'kv.m', factor: 10000 }],
};

function convertTemp(value: number, from: string): string {
  if (from === 'c') return `${(value * 9/5 + 32).toFixed(2)}°F / ${(value + 273.15).toFixed(2)} K`;
  if (from === 'f') return `${((value - 32) * 5/9).toFixed(2)}°C`;
  if (from === 'k') return `${(value - 273.15).toFixed(2)}°C / ${((value - 273.15) * 9/5 + 32).toFixed(2)}°F`;
  return '';
}

export async function olcuCommand(ctx: CommandContext<Context>): Promise<void> {
  const args = (ctx.match ?? '').trim().toLowerCase().split(/\s+/);
  const value = parseFloat(args[0] ?? '');
  const from  = args[1] ?? '';
  const to    = args[2] ?? '';

  if (isNaN(value) || !from) {
    await ctx.reply(
      '📏 *Ölçü çevirici*\n\n' +
      'İstifadə: `/olcu <rəqəm> <vahid> [vahid]`\n\n' +
      '*Dəstəklənən vahidlər:*\n' +
      '📐 Uzunluq: km, mil, m, sm, fut, düym\n' +
      '⚖️ Çəki: kq, funt, q\n' +
      '🌡 Temp: c, f, k\n' +
      '💧 Həcm: l, ml, qalon\n' +
      '🌾 Sahə: ha, dönüm, kv.m\n\n' +
      'Nümunə: `/olcu 100 km` · `/olcu 37 c f`',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  // Temperature special case
  if (['c', 'f', 'k'].includes(from)) {
    const result = convertTemp(value, from);
    if (result) {
      await ctx.reply(`🌡 *${value}°${from.toUpperCase()}* = ${result}`, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply('Bu temperaturu çevirə bilmədim.');
    }
    return;
  }

  const options = CONVERSIONS[from];
  if (!options) {
    await ctx.reply(`"${from}" vahidini tanımadım. /olcu yazaraq siyahıya bax.`);
    return;
  }

  // If target specified, find it; else show all
  const targets = to ? options.filter(o => o.to === to) : options;
  if (targets.length === 0) {
    await ctx.reply(`"${from}" → "${to}" çevirmə mövcud deyil.`);
    return;
  }

  const lines = targets.map(t => `*${(value * t.factor).toFixed(4)} ${t.to}*`).join('\n');
  await ctx.reply(`📏 ${value} ${from} =\n${lines}`, { parse_mode: 'Markdown' });
}
