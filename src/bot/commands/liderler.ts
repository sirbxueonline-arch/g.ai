import type { CommandContext, Context } from 'grammy';
import { db } from '../../db/client.js';
import { logger } from '../../lib/logger.js';

const MONTHS: Record<number, string> = {
  1: 'Yanvar', 2: 'Fevral', 3: 'Mart', 4: 'Aprel',
  5: 'May', 6: 'İyun', 7: 'İyul', 8: 'Avqust',
  9: 'Sentyabr', 10: 'Oktyabr', 11: 'Noyabr', 12: 'Dekabr',
};

export async function liderlerCommand(ctx: CommandContext<Context>): Promise<void> {
  try {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Sum message_count per user for the current month
    const { data, error } = await db
      .from('usage_daily')
      .select('user_id, message_count, users(first_name, username)')
      .gte('date', monthStart);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      await ctx.reply('Bu ay hələ heç bir məlumat yoxdur.');
      return;
    }

    // Aggregate by user_id
    const totals = new Map<string, { name: string; total: number }>();
    for (const row of data as unknown as Array<{
      user_id: string;
      message_count: number;
      users: { first_name: string | null; username: string | null } | null;
    }>) {
      const existing = totals.get(row.user_id);
      const name = row.users?.first_name ?? row.users?.username ?? 'Anonim';
      totals.set(row.user_id, {
        name,
        total: (existing?.total ?? 0) + row.message_count,
      });
    }

    const sorted = [...totals.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const medals = ['🥇', '🥈', '🥉'];
    const lines = sorted.map((u, i) => {
      const medal = medals[i] ?? `${i + 1}.`;
      return `${medal} ${u.name} — ${u.total} mesaj`;
    }).join('\n');

    const monthName = MONTHS[now.getMonth() + 1] ?? '';
    await ctx.reply(
      `🏆 *${monthName} ${now.getFullYear()} — Liderlik cədvəli*\n\n${lines}`,
      { parse_mode: 'Markdown' },
    );
  } catch (err) {
    logger.error('liderlerCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Liderlik cədvəlini əldə edə bilmədim.');
  }
}
