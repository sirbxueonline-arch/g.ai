import type { Context } from 'grammy';
import { getUserByTelegramId, updateUserAlphabet } from '../../db/queries/users.js';
import { getOrCreateConversation } from '../../db/queries/conversations.js';
import { getConversationHistory, insertMessage } from '../../db/queries/messages.js';
import { getDailyUsage, incrementUsage, incrementVoiceSeconds, incrementTokens } from '../../db/queries/usage.js';
import { generateResponse } from '../../core/llm.js';
import { transcribeAudio } from '../../core/speech.js';
import { detectAlphabet } from '../../lib/alphabet.js';
import { logger } from '../../lib/logger.js';
import { isAppError } from '../../lib/errors.js';

const DAILY_TOKEN_DOWNGRADE_THRESHOLD = 40_000;

export async function handleVoice(ctx: Context): Promise<void> {
  const voice = ctx.message?.voice;
  const tgUser = ctx.from;
  if (!voice || !tgUser) return;

  const user = await getUserByTelegramId(tgUser.id);
  if (!user) return;

  await ctx.replyWithChatAction('typing');

  try {
    // Download voice file from Telegram
    const fileInfo = await ctx.api.getFile(voice.file_id);
    const filePath = fileInfo.file_path;
    if (!filePath) throw new Error('No file_path from Telegram');

    const token = process.env['TELEGRAM_BOT_TOKEN']!;
    const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`Failed to download voice file: ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    const transcript = await transcribeAudio(buffer, 'audio/ogg');

    if (!transcript.trim()) {
      await ctx.reply('Səsi eşitdim, amma nə dediyini anlaya bilmədim. Yenidən cəhd et.');
      return;
    }

    // Detect alphabet from transcript and persist
    const alphabet = detectAlphabet(transcript);
    if (alphabet !== 'unknown' && alphabet !== user.alphabet) {
      await updateUserAlphabet(user.id, alphabet);
    }

    const conversation = await getOrCreateConversation(user.id);
    const history = await getConversationHistory(conversation.id, 20);

    await insertMessage({
      conversation_id: conversation.id,
      user_id: user.id,
      role: 'user',
      content: transcript,
      content_type: 'voice',
    });

    const usage = await getDailyUsage(user.id);
    const isHighDailyUser = (usage?.tokens_total ?? 0) >= DAILY_TOKEN_DOWNGRADE_THRESHOLD;

    const result = await generateResponse({
      messages: [
        ...history
          .filter(m => m.role !== 'system')
          .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: transcript },
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
    await incrementVoiceSeconds(user.id, voice.duration);
    await incrementTokens(user.id, result.tokensIn + result.tokensOut);

    // Show transcript so user knows what was heard
    const escaped = transcript.replace(/[_*`[]/g, '\\$&');
    const reply = `🎙 _"${escaped}"_\n\n${result.content}`;
    await ctx.reply(reply, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('handleVoice failed', {
      userId: user.id,
      error: isAppError(err) ? err.message : String(err),
    });
    await ctx.reply('Səs mesajını emal edərkən xəta baş verdi. Bir az sonra yenidən cəhd et.');
  }
}
