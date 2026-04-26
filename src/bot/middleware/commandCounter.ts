import type { Context, NextFunction } from 'grammy';
import { getUserByTelegramId } from '../../db/queries/users.js';
import { incrementUsage } from '../../db/queries/usage.js';
import { logger } from '../../lib/logger.js';

export async function commandCounterMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  await next();

  // Only count actual slash commands, not free-text routed through handleMessage
  if (!ctx.message?.text?.startsWith('/')) return;

  const tgUser = ctx.from;
  if (!tgUser) return;

  try {
    const user = await getUserByTelegramId(tgUser.id);
    if (!user || user.is_banned) return;
    await incrementUsage(user.id, 'message_count');
  } catch (err) {
    logger.error('commandCounterMiddleware failed', {
      telegramId: tgUser.id,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
