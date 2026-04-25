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
import {
  mainMenu, maliyyeMenu, melumatMenu,
  aletlerMenu, aiMenu, meninMenu,
} from '../keyboard.js';

const DAILY_TOKEN_DOWNGRADE_THRESHOLD = 40_000;

// Weather intent detection
const WEATHER_KEYWORDS = [
  'hava', 'havanı', 'havası', 'hava proqnozu', 'hava necə', 'istidir', 'soyuqdur',
  'yağış', 'qar yağır', 'günəşli', 'weather', 'forecast', 'погода', 'hava durumu',
];
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
  const foundCity = AZ_CITIES.find(c => lower.includes(c.toLowerCase()));
  return { isWeather: true, city: foundCity ?? 'Baku' };
}

type Handler = (ctx: Context) => Promise<void>;
const cmd = <T>(fn: (ctx: T) => Promise<void>) => fn as Handler;

const MENU_ROUTES: Record<string, Handler> = {
  // ── Category tabs ────────────────────────────────────────────
  '💰 Maliyyə':   async ctx => { await ctx.reply('💰 Maliyyə', { reply_markup: maliyyeMenu }); },
  '🌍 Məlumat':   async ctx => { await ctx.reply('🌍 Məlumat', { reply_markup: melumatMenu }); },
  '🛠 Alətlər':   async ctx => { await ctx.reply('🛠 Alətlər', { reply_markup: aletlerMenu }); },
  '🤖 AI Köməkçi': async ctx => { await ctx.reply('🤖 AI Köməkçi', { reply_markup: aiMenu }); },
  '📊 Mənim':     async ctx => { await ctx.reply('📊 Mənim', { reply_markup: meninMenu }); },
  '◀️ Geri':      async ctx => { await ctx.reply('Ana menyu', { reply_markup: mainMenu }); },

  // ── Maliyyə ──────────────────────────────────────────────────
  '💵 Məzənnə':   cmd(mezenneCommand),
  '💱 Konvert':   async ctx => { await ctx.reply('💱 *Valyuta çevirici*\n\nİstifadə: `/konvert 100 usd`\nNümunə: `/konvert 50 manat dollar`', { parse_mode: 'Markdown' }); },
  '🏦 Kredit':    async ctx => { await ctx.reply('🏦 *Kredit kalkulatoru*\n\nİstifadə: `/kredit <məbləğ> <faiz%> <ay>`\nNümunə: `/kredit 10000 12 36`', { parse_mode: 'Markdown' }); },

  // ── Məlumat ──────────────────────────────────────────────────
  '🌤 Hava':           cmd(havaCommand),
  '📰 Xəbərlər':      cmd(xeberCommand),
  '📅 Bu gün tarixdə': cmd(historyCommand),
  '🎉 Bayram':         cmd(bayramCommand),
  '🕐 Vaxt':           cmd(vaxtCommand),

  // ── Alətlər ──────────────────────────────────────────────────
  '🔢 Hesab':   async ctx => { await ctx.reply('🔢 *Kalkulyator*\n\nİstifadə: `/hesab <ifadə>`\nNümunə: `/hesab 25 * 4 + 10`', { parse_mode: 'Markdown' }); },
  '📄 Sənəd':   cmd(senedCommand),

  // ── AI Köməkçi ───────────────────────────────────────────────
  '📝 Xülasə':  async ctx => { await ctx.reply('📝 *Mətni xülasələ*\n\nİstifadə: `/özəllər <mətn>`', { parse_mode: 'Markdown' }); },
  '🔤 Tərcümə': async ctx => { await ctx.reply('🔤 *Tərcümə*\n\nİstifadə: `/tərcümə <mətn>`', { parse_mode: 'Markdown' }); },

  // ── Mənim ────────────────────────────────────────────────────
  '📊 Statistika': cmd(statistikaCommand),
  '🏆 Liderlər':   cmd(liderlerCommand),

  // ── Haqqında ─────────────────────────────────────────────────
  'ℹ️ Haqqında': async ctx => {
    await ctx.reply(
      'Mən Guluzada-yam — Azərbaycanlılar üçün hazırlanmış AI köməkçi.\n\n' +
      'Maliyyə, hava, xəbər, tarix, AI alətləri və daha çoxu.\n\n' +
      'Sadəcə yaz və ya səs göndər — hər şeyi başa düşürəm.',
      { reply_markup: mainMenu },
    );
  },
};

export async function handleMessage(ctx: Context): Promise<void> {
  const text = ctx.message?.text;
  const tgUser = ctx.from;
  if (!text || !tgUser) return;

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

  const alphabet = detectAlphabet(text);
  if (alphabet !== 'unknown' && alphabet !== user.alphabet) {
    await updateUserAlphabet(user.id, alphabet);
  }

  const conversation = await getOrCreateConversation(user.id);
  const history = await getConversationHistory(conversation.id, 20);

  await insertMessage({
    conversation_id: conversation.id,
    user_id: user.id,
    role: 'user',
    content: text,
    content_type: 'text',
  });

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
