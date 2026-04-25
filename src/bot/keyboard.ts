import { Keyboard } from 'grammy';

export const mainMenu = new Keyboard()
  .text('💰 Maliyyə').text('🌍 Məlumat')
  .row()
  .text('🛠 Alətlər').text('🤖 AI Köməkçi')
  .row()
  .text('⚽ İdman').text('📊 Mənim')
  .resized()
  .persistent();

// ── Maliyyə ──────────────────────────────────────────────────
export const maliyyeMenu = new Keyboard()
  .text('💵 Məzənnə').text('💱 Konvert')
  .row()
  .text('🏦 Kredit').text('🧮 ƏDV')
  .row()
  .text('⛽ Yanacaq')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();

// ── Məlumat ──────────────────────────────────────────────────
export const melumatMenu = new Keyboard()
  .text('🌤 Hava').text('📰 Xəbərlər')
  .row()
  .text('📅 Bu gün tarixdə').text('🎉 Bayram')
  .row()
  .text('🕐 Vaxt').text('🌐 Viza')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();

// ── Alətlər ──────────────────────────────────────────────────
export const aletlerMenu = new Keyboard()
  .text('🔢 Hesab').text('📏 Ölçü çevir')
  .row()
  .text('📱 QR kod').text('🔗 Link qısal')
  .row()
  .text('📄 Sənəd')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();

// ── AI Köməkçi ───────────────────────────────────────────────
export const aiMenu = new Keyboard()
  .text('📝 Xülasə').text('🔤 Tərcümə')
  .row()
  .text('💡 Günün sözü').text('🎯 Günün sitatı')
  .row()
  .text('🎓 İmtahan köməyi')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();

// ── İdman ────────────────────────────────────────────────────
export const idmanMenu = new Keyboard()
  .text('⚽ Futbol').text('🏀 Basketbol')
  .row()
  .text('🤼 Güləş').text('🥊 Boks')
  .row()
  .text('🎾 Tenis').text('🏅 Digər idman')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();

// ── Mənim ────────────────────────────────────────────────────
export const meninMenu = new Keyboard()
  .text('📊 Statistika').text('🏆 Liderlər')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();
