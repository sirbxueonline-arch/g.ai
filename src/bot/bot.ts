import { Bot } from 'grammy';
import { userUpsertMiddleware } from './middleware/userUpsert.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.js';
import { requestLoggerMiddleware } from './middleware/requestLogger.js';
import { startCommand } from './commands/start.js';
import { mezenneCommand } from './commands/mezenne.js';
import { havaCommand } from './commands/hava.js';
import { senedCommand } from './commands/senəd.js';
import { historyCommand } from './commands/history.js';
import { handleMessage } from './handlers/message.js';
import { handleVoice } from './handlers/voice.js';
import { handlePhoto } from './handlers/photo.js';
import { logger } from '../lib/logger.js';

const token = process.env['TELEGRAM_BOT_TOKEN'];
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');

export const bot = new Bot(token);

bot.use(requestLoggerMiddleware);
bot.use(userUpsertMiddleware);
bot.use(rateLimiterMiddleware);

bot.command('start', startCommand);
bot.command(['mezenne', 'məzənnə'], mezenneCommand);
bot.command(['hava'], havaCommand);
bot.command(['sened', 'sənəd'], senedCommand);
bot.command('history', historyCommand);

bot.on('message:text', handleMessage);
bot.on('message:voice', handleVoice);
bot.on('message:photo', handlePhoto);

bot.catch(err => {
  logger.error('Unhandled bot error', {
    error: err.message,
    update: err.ctx.update ? Object.keys(err.ctx.update).find(k => k !== 'update_id') : 'unknown',
  });
});
