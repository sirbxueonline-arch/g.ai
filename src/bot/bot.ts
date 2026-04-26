import { Bot } from 'grammy';
import { userUpsertMiddleware } from './middleware/userUpsert.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.js';
import { requestLoggerMiddleware } from './middleware/requestLogger.js';
import { commandCounterMiddleware } from './middleware/commandCounter.js';
import { startCommand } from './commands/start.js';
import { mezenneCommand } from './commands/mezenne.js';
import { havaCommand } from './commands/hava.js';
import { senedCommand } from './commands/senəd.js';
import { historyCommand } from './commands/history.js';
import { xeberCommand } from './commands/xeber.js';
import { konvertCommand } from './commands/konvert.js';
import { kreditCommand } from './commands/kredit.js';
import { bayramCommand } from './commands/bayram.js';
import { hesabCommand } from './commands/hesab.js';
import { vaxtCommand } from './commands/vaxt.js';
import { ozellerCommand } from './commands/ozeller.js';
import { tercumeCommand } from './commands/tercume.js';
import { statistikaCommand } from './commands/statistika.js';
import { liderlerCommand } from './commands/liderler.js';
import { yanacaqCommand } from './commands/yanacaq.js';
import { edvCommand } from './commands/edv.js';
import { olcuCommand } from './commands/olcu.js';
import { sozdəgunCommand } from './commands/sozdegun.js';
import { sitatCommand } from './commands/sitat.js';
import { idmanCommand } from './commands/idman.js';
import { qrkodCommand } from './commands/qrkod.js';
import { linkCommand } from './commands/link.js';
import { vizaCommand } from './commands/viza.js';
import { imtahanCommand } from './commands/imtahan.js';
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
bot.use(commandCounterMiddleware);

bot.command('start', startCommand);
bot.command(['mezenne', 'məzənnə'], mezenneCommand);
bot.command('hava', havaCommand);
bot.command(['sened', 'sənəd'], senedCommand);
bot.command('history', historyCommand);
bot.command(['xeber', 'xəbər'], xeberCommand);
bot.command('konvert', konvertCommand);
bot.command('kredit', kreditCommand);
bot.command('bayram', bayramCommand);
bot.command('hesab', hesabCommand);
bot.command('vaxt', vaxtCommand);
bot.command(['ozeller', 'özəllər'], ozellerCommand);
bot.command(['tercume', 'tərcümə'], tercumeCommand);
bot.command('statistika', statistikaCommand);
bot.command(['liderler', 'liderboard'], liderlerCommand);
bot.command('yanacaq', yanacaqCommand);
bot.command('edv', edvCommand);
bot.command(['olcu', 'ölçü'], olcuCommand);
bot.command(['sozdegun', 'sözdəgün'], sozdəgunCommand);
bot.command('sitat', sitatCommand);
bot.command('idman', idmanCommand);
bot.command('qrkod', qrkodCommand);
bot.command('link', linkCommand);
bot.command('viza', vizaCommand);
bot.command(['imtahan'], imtahanCommand);

bot.on('message:text', handleMessage);
bot.on('message:voice', handleVoice);
bot.on('message:photo', handlePhoto);

bot.catch(err => {
  logger.error('Unhandled bot error', {
    error: err.message,
    update: err.ctx.update ? Object.keys(err.ctx.update).find(k => k !== 'update_id') : 'unknown',
  });
});
