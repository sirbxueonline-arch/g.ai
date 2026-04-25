import type { CommandContext, Context } from 'grammy';
import { getNextHoliday } from '../../core/tools/holidays.js';

export async function bayramCommand(ctx: CommandContext<Context>): Promise<void> {
  const { holiday, daysLeft, dateStr } = getNextHoliday();

  const label = daysLeft === 0
    ? 'Bu gün!'
    : daysLeft === 1
    ? 'Sabah!'
    : `${daysLeft} gün qaldı`;

  await ctx.reply(
    `🎉 *Növbəti bayram*\n\n` +
    `📌 ${holiday.name}\n` +
    `📅 ${dateStr}\n` +
    `⏳ ${label}`,
    { parse_mode: 'Markdown' },
  );
}
