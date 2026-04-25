import type { CommandContext, Context } from 'grammy';

const VIZA_INFO: Record<string, { status: string; note: string }> = {
  'türkiyə':     { status: '✅ Vizasız',     note: '90 gün, yalnız pasport' },
  'rusiya':      { status: '✅ Vizasız',     note: '90 gün' },
  'gürcüstan':   { status: '✅ Vizasız',     note: '365 gün' },
  'ukrayna':     { status: '✅ Vizasız',     note: '90 gün' },
  'qazaxıstan':  { status: '✅ Vizasız',     note: '30 gün' },
  'belarusiya':  { status: '✅ Vizasız',     note: '30 gün' },
  'serbiya':     { status: '✅ Vizasız',     note: '30 gün' },
  'qırğızıstan': { status: '✅ Vizasız',     note: '30 gün' },
  'əbu-dabi':    { status: '✅ Vizasız',     note: 'BAƏ — 30 gün' },
  'dubai':       { status: '✅ Vizasız',     note: 'BAƏ — 30 gün' },
  'iran':        { status: '✅ Vizasız',     note: '90 gün (quru sərhədi)' },
  'almaniya':    { status: '🟡 Şengen viza', note: 'Konsulluqda müraciət' },
  'fransa':      { status: '🟡 Şengen viza', note: 'Konsulluqda müraciət' },
  'italiya':     { status: '🟡 Şengen viza', note: 'Konsulluqda müraciət' },
  'ispaniya':    { status: '🟡 Şengen viza', note: 'Konsulluqda müraciət' },
  'hollandiya':  { status: '🟡 Şengen viza', note: 'Konsulluqda müraciət' },
  'böyük britaniya': { status: '🔴 UK vizası', note: 'Onlayn müraciət' },
  'abd':         { status: '🔴 Viza',         note: 'DS-160 forması, müsahibə' },
  'kanada':      { status: '🔴 Viza',         note: 'Onlayn müraciət + biometrik' },
  'avstraliya':  { status: '🔴 Viza',         note: 'ETA və ya viza' },
  'yaponiya':    { status: '🔴 Viza',         note: 'Konsulluqda müraciət' },
  'çin':         { status: '🔴 Viza',         note: 'Konsulluqda müraciət' },
};

export async function vizaCommand(ctx: CommandContext<Context>): Promise<void> {
  const query = (ctx.match ?? '').trim().toLowerCase();

  if (!query) {
    const vizasiz = Object.entries(VIZA_INFO)
      .filter(([, v]) => v.status.includes('Vizasız'))
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
      .join(', ');

    await ctx.reply(
      '🌐 *Viza məlumatı*\n\n' +
      'İstifadə: `/viza <ölkə>`\n' +
      'Nümunə: `/viza türkiyə`\n\n' +
      `*Vizasız ölkələr:*\n${vizasiz}`,
      { parse_mode: 'Markdown' },
    );
    return;
  }

  const info = VIZA_INFO[query];
  if (!info) {
    await ctx.reply(`"${query}" üçün məlumat tapılmadı. /viza yazaraq siyahıya bax.`);
    return;
  }

  const name = query.charAt(0).toUpperCase() + query.slice(1);
  await ctx.reply(
    `🌐 *${name}*\n\n${info.status}\n📝 ${info.note}\n\n_Məlumat dəyişə bilər. Səfərdən əvvəl rəsmi mənbəyi yoxla._`,
    { parse_mode: 'Markdown' },
  );
}
