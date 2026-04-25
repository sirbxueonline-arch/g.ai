import type { CommandContext, Context } from 'grammy';
import { mainMenu } from '../keyboard.js';

export async function startCommand(ctx: CommandContext<Context>): Promise<void> {
  const name = ctx.from?.first_name ?? 'Salam';
  await ctx.reply(
    `Salam, ${name}! 👋\n\n` +
    `Mən Guluzada-yam — Azərbaycanlılar üçün AI köməkçi.\n\n` +
    `*Nə edə bilərəm:*\n` +
    `💵 /məzənnə — valyuta kursları\n` +
    `🌤 /hava — hava proqnozu\n` +
    `📰 /xəbər — son xəbərlər\n` +
    `📅 /history — bu gün tarixdə\n` +
    `🎉 /bayram — növbəti bayram\n` +
    `🕐 /vaxt — dünya saatları\n` +
    `💱 /konvert 100 usd — valyuta çevir\n` +
    `🏦 /kredit — kredit kalkulatoru\n` +
    `🔢 /hesab — kalkulyator\n` +
    `📝 /özəllər — mətni xülasələ\n` +
    `🔤 /tərcümə — mətn tərcüməsi\n` +
    `📄 /sənəd — sənəd izahı\n` +
    `📊 /statistika — istifadə statistikan\n` +
    `🏆 /liderler — aylıq liderlik cədvəli\n\n` +
    `Yaz və ya səs göndər!`,
    { reply_markup: mainMenu, parse_mode: 'Markdown' },
  );
}
