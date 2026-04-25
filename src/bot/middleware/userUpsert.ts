import type { Context, NextFunction } from 'grammy';
import { upsertUser } from '../../db/queries/users.js';
import { logger } from '../../lib/logger.js';

export async function userUpsertMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const tgUser = ctx.from;
  if (!tgUser) {
    await next();
    return;
  }

  try {
    await upsertUser({
      telegram_id: tgUser.id,
      username: tgUser.username ?? null,
      first_name: tgUser.first_name ?? null,
      last_name: tgUser.last_name ?? null,
      language_code: tgUser.language_code ?? null,
    });
  } catch (err) {
    logger.error('userUpsert middleware failed', {
      telegramId: tgUser.id,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  await next();
}
