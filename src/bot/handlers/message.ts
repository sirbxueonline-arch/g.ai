import type { Context } from 'grammy';
import { getUserByTelegramId, updateUserAlphabet } from '../../db/queries/users.js';
import { getOrCreateConversation } from '../../db/queries/conversations.js';
import { getConversationHistory, insertMessage } from '../../db/queries/messages.js';
import { getDailyUsage, incrementUsage, incrementTokens } from '../../db/queries/usage.js';
import { generateResponse } from '../../core/llm.js';
import { detectAlphabet } from '../../lib/alphabet.js';
import { logger } from '../../lib/logger.js';
import { isAppError } from '../../lib/errors.js';
import { mezenneCommand } from '../commands/mezenne.js';
import { havaCommand } from '../commands/hava.js';
import { historyCommand } from '../commands/history.js';
import { senedCommand } from '../commands/senəd.js';
import { xeberCommand } from '../commands/xeber.js';
import { bayramCommand } from '../commands/bayram.js';
import { vaxtCommand } from '../commands/vaxt.js';
import { statistikaCommand } from '../commands/statistika.js';
import { liderlerCommand } from '../commands/liderler.js';
import { getWeather, formatWeather } from '../../core/tools/weather.js';

const DAILY_TOKEN_DOWNGRADE_THRESHOLD = 40_000;

// Keywords that signal a weather intent (Azerbaijani, Russian, English, Turkish)
const WEATHER_KEYWORDS = [
  'hava', 'havanı', 'havası', 'hava proqnozu', 'hava necə', 'istidir', 'soyuqdur',
  'yağış', 'qar yağır', 'günəşli',
  'weather', 'forecast',
  'погода', 'какая погода',
  'hava durumu',
];

// Known Azerbaijani cities to extract from natural language
const AZ_CITIES = [
  'Bakı', 'Baku', 'Gəncə', 'Gence', 'Sumqayıt', 'Sumgait',
  'Lənkəran', 'Lankaran', 'Mingəçevir', 'Naxçıvan', 'Nakhchivan',
  'Şirvan', 'Shirvan', 'Xankəndi', 'Şəki', 'Sheki',
  'Quba', 'Qusar', 'Şamaxı', 'Shamakhi', 'Zaqatala',
];

function detectWeatherIntent(text: string): { isWeather: boolean; city: string } {
  const lower = text.toLowerCase();
  const isWeather = WEATHER_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
  if (!isWeather) return { isWeather: false, city: 'Baku' };

  const foundCity = AZ_CITIES.find(c => text.toLowerCase().includes(c.toLowerCase()));
  return { isWeather: true, city: foundCity ?? 'Baku' };
}

// Menu button tap → delegate to the matching command
const MENU_ROUTES: Record<string, (ctx: Context) => Promise<void>> = {
  '💵 Məzənnə':        ctx => mezenneCommand(ctx as Parameters<typeof mezenneCommand>[0]),
  '🌤 Hava':           ctx => havaCommand(ctx as Parameters<typeof havaCommand>[0]),
  '📰 Xəbərlər':      ctx => xeberCommand(ctx as Parameters<typeof xeberCommand>[0]),
  '📅 Bu gün tarixdə': ctx => historyCommand(ctx as Parameters<typeof historyCommand>[0]),
  '🎉 Bayram':         ctx => bayramCommand(ctx as Parameters<typeof bayramCommand>[0]),
  '🕐 Vaxt':           ctx => vaxtCommand(ctx as Parameters<typeof vaxtCommand>[0]),
  '💱 Konvert':        async ctx => { await ctx.reply('İstifadə: `/konvert 100 usd`', { parse_mode: 'Markdown' }); },
  '🏦 Kredit':         async ctx => { await ctx.reply('İstifadə: `/kredit 10000 12 36`\n_(məbləğ, faiz%, ay)_', { parse_mode: 'Markdown' }); },
  '🔢 Hesab':          async ctx => { await ctx.reply('İstifadə: `/hesab 25 * 4 + 10`', { parse_mode: 'Markdown' }); },
  '📝 Xülasə':         async ctx => { await ctx.reply('İstifadə: `/özəllər <mətn>`', { parse_mode: 'Markdown' }); },
  '🔤 Tərcümə':        async ctx => { await ctx.reply('İstifadə: `/tərcümə <mətn>`', { parse_mode: 'Markdown' }); },
  '📄 Sənəd':          ctx => senedCommand(ctx as Parameters<typeof senedCommand>[0]),
  '📊 Statistika':     ctx => statistikaCommand(ctx as Parameters<typeof statistikaCommand>[0]),
  '🏆 Liderlər':       ctx => liderlerCommand(ctx as Parameters<typeof liderlerCommand>[0]),
  'ℹ️ Haqqında': async ctx => {
    await ctx.reply(
      'Mən Guluzada-yam — Azərbaycanlılar üçün hazırlanmış AI köməkçi.\n\n' +
      '💵 /məzənnə — valyuta kursları\n' +
      '🌤 /hava — hava proqnozu\n' +
      '📰 /xəbər — son xəbərlər\n' +
      '📅 /history — bu gün tarixdə\n' +
      '🎉 /bayram — növbəti bayram\n' +
      '🕐 /vaxt — dünya saatları\n' +
      '💱 /konvert 100 usd — valyuta çevir\n' +
      '🏦 /kredit — kredit kalkulatoru\n' +
      '🔢 /hesab — kalkulyator\n' +
      '📝 /özəllər — mətni xülasələ\n' +
      '🔤 /tərcümə — mətn tərcüməsi\n' +
      '📊 /statistika — istifadə statistikan',
    );
  },
};

export async function handleMessage(ctx: Context): Promise<void> {
  const text = ctx.message?.text;
  const tgUser = ctx.from;
  if (!text || !tgUser) return;

  // Handle menu button taps without going to the LLM
  const menuHandler = MENU_ROUTES[text];
  if (menuHandler) {
    await menuHandler(ctx);
    return;
  }

  // Natural language weather intent
  const { isWeather, city } = detectWeatherIntent(text);
  if (isWeather) {
    await ctx.replyWithChatAction('typing');
    try {
      const weather = await getWeather(city);
      await ctx.reply(`*${weather.city} hava proqnozu*\n\n` + formatWeather(weather), {
        parse_mode: 'Markdown',
      });
    } catch {
      await ctx.reply('Hava məlumatını əldə edə bilmədim. Bir az sonra cəhd et.');
    }
    return;
  }

  const user = await getUserByTelegramId(tgUser.id);
  if (!user) return;

  // Detect and persist alphabet preference
  const alphabet = detectAlphabet(text);
  if (alphabet !== 'unknown' && alphabet !== user.alphabet) {
    await updateUserAlphabet(user.id, alphabet);
  }

  const conversation = await getOrCreateConversation(user.id);
  const history = await getConversationHistory(conversation.id, 20);

  // Persist user message
  await insertMessage({
    conversation_id: conversation.id,
    user_id: user.id,
    role: 'user',
    content: text,
    content_type: 'text',
  });

  // Check if user should be downgraded to cheap tier
  const usage = await getDailyUsage(user.id);
  const isHighDailyUser = (usage?.tokens_total ?? 0) >= DAILY_TOKEN_DOWNGRADE_THRESHOLD;

  await ctx.replyWithChatAction('typing');

  try {
    const result = await generateResponse({
      messages: [
        ...history
          .filter(m => m.role !== 'system')
          .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: text },
      ],
      isHighDailyUser,
    });

    // Persist assistant message
    await insertMessage({
      conversation_id: conversation.id,
      user_id: user.id,
      role: 'assistant',
      content: result.content,
      content_type: 'text',
      model_used: result.model,
      tokens_in: result.tokensIn,
      tokens_out: result.tokensOut,
      latency_ms: result.latencyMs,
    });

    await incrementUsage(user.id, 'message_count');
    await incrementTokens(user.id, result.tokensIn + result.tokensOut);

    await ctx.reply(result.content, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('handleMessage failed', {
      userId: user.id,
      error: isAppError(err) ? err.message : String(err),
    });
    await ctx.reply('Xəta baş verdi. Bir az sonra yenidən cəhd et.');
  }
}
