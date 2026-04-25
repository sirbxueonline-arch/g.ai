import { Keyboard } from 'grammy';

export const mainMenu = new Keyboard()
  .text('💵 Məzənnə').text('🌤 Hava')
  .row()
  .text('📰 Xəbərlər').text('📅 Bu gün tarixdə')
  .row()
  .text('🎉 Növbəti bayram').text('🕐 Vaxt')
  .row()
  .text('📄 Sənəd izahı').text('📊 Statistika')
  .row()
  .text('🏆 Liderlər').text('ℹ️ Haqqında')
  .resized()
  .persistent();
