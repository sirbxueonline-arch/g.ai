import { bot } from './bot/bot.js';
import { logger } from './lib/logger.js';

async function main() {
  logger.info('Starting Guluzada bot (long-polling)...');
  await bot.start({
    onStart: info => logger.info('Bot started', { username: info.username }),
  });
}

main().catch(err => {
  logger.error('Fatal startup error', { error: String(err) });
  process.exit(1);
});
