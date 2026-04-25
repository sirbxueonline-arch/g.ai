import type { CommandContext, Context } from 'grammy';
import { getUserByTelegramId } from '../../db/queries/users.js';
import { getDailyUsage } from '../../db/queries/usage.js';
import { logger } from '../../lib/logger.js';

const MSG_LIMIT  = parseInt(process.env['RATE_LIMIT_MESSAGES_PER_DAY'] ?? '50', 10);
const DOC_LIMIT  = parseInt(process.env['RATE_LIMIT_DOCUMENTS_PER_DAY'] ?? '5', 10);
const VOICE_MIN  = parseInt(process.env['RATE_LIMIT_VOICE_MINUTES_PER_DAY'] ?? '10', 10);

function bar(used: number, max: number, width = 10): string {
  const filled = Math.round((used / max) * width);
  return '█'.repeat(Math.min(filled, width)) + '░'.repeat(Math.max(width - filled, 0));
}

export async function statistikaCommand(ctx: CommandContext<Context>): Promise<void> {
  const tgUser = ctx.from;
  if (!tgUser) return;

  try {
    const user = await getUserByTelegramId(tgUser.id);
    if (!user) { await ctx.reply('İstifadəçi tapılmadı.'); return; }

    const usage = await getDailyUsage(user.id);
    const msgs   = usage?.message_count  ?? 0;
    const docs   = usage?.document_count ?? 0;
    const voiceSec = usage?.voice_seconds ?? 0;
    const voiceMin = Math.round(voiceSec / 60);
    const tokens = usage?.tokens_total   ?? 0;

    const since = new Date(user.created_at).toLocaleDateString('az-AZ');

    await ctx.reply(
      `📊 *Bu günkü statistika*\n\n` +
      `💬 Mesajlar: ${msgs}/${MSG_LIMIT}\n` +
      `\`${bar(msgs, MSG_LIMIT)}\`\n\n` +
      `🎙 Səs: ${voiceMin}/${VOICE_MIN} dəq\n` +
      `\`${bar(voiceMin, VOICE_MIN)}\`\n\n` +
      `📄 Sənədlər: ${docs}/${DOC_LIMIT}\n` +
      `\`${bar(docs, DOC_LIMIT)}\`\n\n` +
      `🔤 Ümumi token: ${tokens.toLocaleString()}\n` +
      `📅 Qeydiyyat: ${since}`,
      { parse_mode: 'Markdown' },
    );
  } catch (err) {
    logger.error('statistikaCommand failed', { error: err instanceof Error ? err.message : String(err) });
    await ctx.reply('Statistikanı əldə edə bilmədim.');
  }
}
