import type { Context } from 'grammy';
import { getUserByTelegramId, updateUserAlphabet } from '../../db/queries/users.js';
import { getOrCreateConversation } from '../../db/queries/conversations.js';
import { getConversationHistory, insertMessage } from '../../db/queries/messages.js';
import { getDailyUsage, incrementUsage, incrementTokens } from '../../db/queries/usage.js';
import { generateResponse } from '../../core/llm.js';
import { detectAlphabet } from '../../lib/alphabet.js';
import { logger } from '../../lib/logger.js';
import { isAppError } from '../../lib/errors.js';

const DAILY_TOKEN_DOWNGRADE_THRESHOLD = 40_000;

export async function handleMessage(ctx: Context): Promise<void> {
  const text = ctx.message?.text;
  const tgUser = ctx.from;
  if (!text || !tgUser) return;

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
