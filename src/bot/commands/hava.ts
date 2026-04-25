import type { CommandContext, Context } from 'grammy';
import { getWeather, formatWeather } from '../../core/tools/weather.js';
import { logger } from '../../lib/logger.js';

export async function havaCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.replyWithChatAction('typing');

  // Allow "/hava Gəncə" to specify another city
  const args = ctx.match?.trim();
  const city = args && args.length > 0 ? args : 'Baku';

  try {
    const weather = await getWeather(city);
    const text = `*${weather.city} hava proqnozu*\n\n` + formatWeather(weather);
    await ctx.reply(text, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('havaCommand failed', {
      city,
      error: err instanceof Error ? err.message : String(err),
    });
    await ctx.reply('Hal-hazırda hava məlumatını ala bilmirəm. Bir az sonra cəhd et.');
  }
}
