import type { CommandContext, Context } from 'grammy';

// M = P * [r(1+r)^n] / [(1+r)^n - 1]
function monthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

export async function kreditCommand(ctx: CommandContext<Context>): Promise<void> {
  const args = (ctx.match ?? '').trim().split(/\s+/);
  // /kredit <məbləğ> <faiz%> <ay>
  const principal = parseFloat(args[0] ?? '');
  const rate      = parseFloat(args[1] ?? '');
  const months    = parseInt(args[2] ?? '', 10);

  if (isNaN(principal) || isNaN(rate) || isNaN(months) || months <= 0) {
    await ctx.reply(
      '*Kredit kalkulatoru*\n\n' +
      'İstifadə: `/kredit <məbləğ> <illik faiz%> <ay sayı>`\n\n' +
      'Nümunə: `/kredit 10000 12 36`\n' +
      '_(10,000 ₼, 12% illik, 36 ay)_',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  const monthly = monthlyPayment(principal, rate, months);
  const total   = monthly * months;
  const interest = total - principal;

  await ctx.reply(
    `🏦 *Kredit hesablaması*\n\n` +
    `💰 Məbləğ: ${principal.toLocaleString('az-AZ')} ₼\n` +
    `📊 İllik faiz: ${rate}%\n` +
    `📅 Müddət: ${months} ay\n\n` +
    `─────────────────\n` +
    `💳 Aylıq ödəniş: *${monthly.toFixed(2)} ₼*\n` +
    `📈 Ümumi faiz: ${interest.toFixed(2)} ₼\n` +
    `💵 Ümumi ödəniş: ${total.toFixed(2)} ₼`,
    { parse_mode: 'Markdown' },
  );
}
