import type { Context, NextFunction } from 'grammy';
import { getUserByTelegramId } from '../../db/queries/users.js';
import { getDailyUsage } from '../../db/queries/usage.js';
import { RateLimitError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';

const MSG_LIMIT = parseInt(process.env['RATE_LIMIT_MESSAGES_PER_DAY'] ?? '50', 10);
const DOC_LIMIT = parseInt(process.env['RATE_LIMIT_DOCUMENTS_PER_DAY'] ?? '5', 10);
const VOICE_MIN_LIMIT = parseInt(process.env['RATE_LIMIT_VOICE_MINUTES_PER_DAY'] ?? '10', 10);

export async function rateLimiterMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const tgUser = ctx.from;
  if (!tgUser) {
    await next();
    return;
  }

  try {
    const user = await getUserByTelegramId(tgUser.id);
    if (!user) {
      await next();
      return;
    }

    if (user.is_banned) {
      await ctx.reply('Hesabınız bloklanıb. Daha ətraflı məlumat üçün @guluzada_support ilə əlaqə saxlayın.');
      return;
    }

    const usage = await getDailyUsage(user.id);
    const msgCount = usage?.message_count ?? 0;
    const docCount = usage?.document_count ?? 0;
    const voiceSec = usage?.voice_seconds ?? 0;

    const isDocument = ctx.message?.document !== undefined;
    const isVoice = ctx.message?.voice !== undefined;

    if (isDocument && docCount >= DOC_LIMIT) {
      throw new RateLimitError(tgUser.id, 'documents');
    }
    if (isVoice && voiceSec >= VOICE_MIN_LIMIT * 60) {
      throw new RateLimitError(tgUser.id, 'voice_minutes');
    }
    if (msgCount >= MSG_LIMIT) {
      throw new RateLimitError(tgUser.id, 'messages');
    }
  } catch (err) {
    if (err instanceof RateLimitError) {
      const messages: Record<string, string> = {
        messages: `⚠️ Bu gün üçün mesaj limitinə çatdın (${MSG_LIMIT} mesaj). Sabah yenidən istifadə edə bilərsən.`,
        voice_minutes: `⚠️ Bu gün üçün səs mesajı limitinə çatdın (${VOICE_MIN_LIMIT} dəqiqə).`,
        documents: `⚠️ Bu gün üçün sənəd limitinə çatdın (${DOC_LIMIT} sənəd).`,
      };
      const resource = (err as RateLimitError).context?.['resource'] as string | undefined;
      await ctx.reply(messages[resource ?? ''] ?? '⚠️ Limitə çatdın.');
      return;
    }

    logger.error('rateLimiter middleware failed', {
      telegramId: tgUser.id,
      error: err instanceof Error ? err.message : String(err),
    });
    await next();
    return;
  }

  await next();
}
