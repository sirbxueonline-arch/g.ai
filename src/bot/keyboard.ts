import { Keyboard } from 'grammy';

export const mainMenu = new Keyboard()
  .text('💵 Məzənnə').text('🌤 Hava').text('📰 Xəbərlər')
  .row()
  .text('📅 Bu gün tarixdə').text('🎉 Bayram').text('🕐 Vaxt')
  .row()
  .text('💱 Konvert').text('🏦 Kredit').text('🔢 Hesab')
  .row()
  .text('📝 Xülasə').text('🔤 Tərcümə').text('📄 Sənəd')
  .row()
  .text('📊 Statistika').text('🏆 Liderlər').text('ℹ️ Haqqında')
  .resized()
  .persistent();
