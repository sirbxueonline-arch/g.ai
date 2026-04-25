import { Keyboard } from 'grammy';

export const mainMenu = new Keyboard()
  .text('💰 Maliyyə').text('🌍 Məlumat')
  .row()
  .text('🛠 Alətlər').text('🤖 AI Köməkçi')
  .row()
  .text('📊 Mənim').text('ℹ️ Haqqında')
  .resized()
  .persistent();

export const maliyyeMenu = new Keyboard()
  .text('💵 Məzənnə').text('💱 Konvert')
  .row()
  .text('🏦 Kredit')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();

export const melumatMenu = new Keyboard()
  .text('🌤 Hava').text('📰 Xəbərlər')
  .row()
  .text('📅 Bu gün tarixdə').text('🎉 Bayram')
  .row()
  .text('🕐 Vaxt')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();

export const aletlerMenu = new Keyboard()
  .text('🔢 Hesab').text('📄 Sənəd')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();

export const aiMenu = new Keyboard()
  .text('📝 Xülasə').text('🔤 Tərcümə')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();

export const meninMenu = new Keyboard()
  .text('📊 Statistika').text('🏆 Liderlər')
  .row()
  .text('◀️ Geri')
  .resized()
  .persistent();
