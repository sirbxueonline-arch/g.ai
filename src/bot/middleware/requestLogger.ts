import type { Context, NextFunction } from 'grammy';
import { logger } from '../../lib/logger.js';

export async function requestLoggerMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const start = Date.now();
  const updateType = ctx.update ? Object.keys(ctx.update).find(k => k !== 'update_id') : 'unknown';
  const userId = ctx.from?.id;

  await next();

  logger.info('telegram update processed', {
    updateType,
    userId,
    latencyMs: Date.now() - start,
  });
}
