import { Keyboard } from 'grammy';

export const mainMenu = new Keyboard()
  .text('💵 Məzənnə').text('🌤 Hava')
  .row()
  .text('📅 Bu gün tarixdə').text('📄 Sənəd izahı')
  .row()
  .text('ℹ️ Haqqında')
  .resized()
  .persistent();
