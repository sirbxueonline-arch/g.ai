import type { CommandContext, Context } from 'grammy';

const CITIES = [
  { name: 'Bakı 🇦🇿',     tz: 'Asia/Baku' },
  { name: 'İstanbul 🇹🇷',  tz: 'Europe/Istanbul' },
  { name: 'Moskva 🇷🇺',    tz: 'Europe/Moscow' },
  { name: 'Dubai 🇦🇪',     tz: 'Asia/Dubai' },
  { name: 'London 🇬🇧',    tz: 'Europe/London' },
  { name: 'Nyu-York 🇺🇸',  tz: 'America/New_York' },
];

function formatTime(tz: string): string {
  return new Date().toLocaleTimeString('az-AZ', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export async function vaxtCommand(ctx: CommandContext<Context>): Promise<void> {
  const lines = CITIES.map(c => `${c.name}: *${formatTime(c.tz)}*`).join('\n');
  await ctx.reply(`🕐 *İndiki vaxt*\n\n${lines}`, { parse_mode: 'Markdown' });
}
