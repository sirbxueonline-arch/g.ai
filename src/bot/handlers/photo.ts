import type { Context } from 'grammy';
import { getUserByTelegramId } from '../../db/queries/users.js';
import { getOrCreateConversation } from '../../db/queries/conversations.js';
import { insertMessage } from '../../db/queries/messages.js';
import { getDailyUsage, incrementUsage, incrementTokens } from '../../db/queries/usage.js';
import { generateResponse } from '../../core/llm.js';
import { logger } from '../../lib/logger.js';
import { isAppError } from '../../lib/errors.js';

const DAILY_TOKEN_DOWNGRADE_THRESHOLD = 40_000;

export async function handlePhoto(ctx: Context): Promise<void> {
  const photos = ctx.message?.photo;
  const tgUser = ctx.from;
  if (!photos || photos.length === 0 || !tgUser) return;

  const user = await getUserByTelegramId(tgUser.id);
  if (!user) return;

  await ctx.replyWithChatAction('typing');

  try {
    // Use the highest resolution photo
    const photo = photos[photos.length - 1]!;
    const fileInfo = await ctx.api.getFile(photo.file_id);
    const filePath = fileInfo.file_path;
    if (!filePath) throw new Error('No file_path from Telegram');

    const token = process.env['TELEGRAM_BOT_TOKEN']!;
    const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`Failed to download photo: ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    const base64 = buffer.toString('base64');

    const caption = ctx.message?.caption ?? 'Bu sənədi Azərbaycan dilində sadə şəkildə izah et.';

    const conversation = await getOrCreateConversation(user.id);

    await insertMessage({
      conversation_id: conversation.id,
      user_id: user.id,
      role: 'user',
      content: caption,
      content_type: 'photo',
    });

    const usage = await getDailyUsage(user.id);
    const isHighDailyUser = (usage?.tokens_total ?? 0) >= DAILY_TOKEN_DOWNGRADE_THRESHOLD;

    const result = await generateResponse({
      messages: [{ role: 'user', content: caption }],
      hasImage: true,
      imageBase64: base64,
      imageMimeType: 'image/jpeg',
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

    await incrementUsage(user.id, 'document_count');
    await incrementTokens(user.id, result.tokensIn + result.tokensOut);

    await ctx.reply(result.content, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error('handlePhoto failed', {
      userId: user.id,
      error: isAppError(err) ? err.message : String(err),
    });
    await ctx.reply('Şəkli emal edərkən xəta baş verdi. Bir az sonra yenidən cəhd et.');
  }
}
