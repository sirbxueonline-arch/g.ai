export type Alphabet = 'latin' | 'cyrillic' | 'unknown';

// Azerbaijani Cyrillic range + common Cyrillic chars
const CYRILLIC_RE = /[\u0400-\u04FF]/;
const LATIN_AZ_RE = /[a-züöğışçəƏÜÖĞIŞÇ]/i;

export function detectAlphabet(text: string): Alphabet {
  const hasCyrillic = CYRILLIC_RE.test(text);
  const hasLatin = LATIN_AZ_RE.test(text);

  if (hasCyrillic && !hasLatin) return 'cyrillic';
  if (hasLatin && !hasCyrillic) return 'latin';
  if (hasCyrillic) return 'cyrillic'; // mixed → prefer what the user started with
  return 'unknown';
}

// Latin → Cyrillic mapping for Azerbaijani
const LATIN_TO_CYR: Record<string, string> = {
  A: 'А', a: 'а', B: 'Б', b: 'б', C: 'Ҹ', c: 'ҹ', Ç: 'Ч', ç: 'ч',
  D: 'Д', d: 'д', E: 'Е', e: 'е', Ə: 'Ə', ə: 'ə', F: 'Ф', f: 'ф',
  G: 'Ҝ', g: 'ҝ', Ğ: 'Ғ', ğ: 'ғ', H: 'Һ', h: 'һ', X: 'Х', x: 'х',
  I: 'И', i: 'и', İ: 'И', Ş: 'Ш', ş: 'ш', J: 'Ж', j: 'ж',
  K: 'К', k: 'к', Q: 'Г', q: 'г', L: 'Л', l: 'л', M: 'М', m: 'м',
  N: 'Н', n: 'н', O: 'О', o: 'о', Ö: 'Ö', ö: 'ö', P: 'П', p: 'п',
  R: 'Р', r: 'р', S: 'С', s: 'с', T: 'Т', t: 'т', U: 'У', u: 'у',
  Ü: 'Ü', ü: 'ü', V: 'В', v: 'в', Y: 'Ј', y: 'ј', Z: 'З', z: 'з',
};

const CYR_TO_LATIN: Record<string, string> = Object.fromEntries(
  Object.entries(LATIN_TO_CYR).map(([l, c]) => [c, l]),
);

export function latinToCyrillic(text: string): string {
  return text.split('').map(ch => LATIN_TO_CYR[ch] ?? ch).join('');
}

export function cyrillicToLatin(text: string): string {
  return text.split('').map(ch => CYR_TO_LATIN[ch] ?? ch).join('');
}

export function convertTo(text: string, target: Alphabet): string {
  if (target === 'cyrillic') return latinToCyrillic(text);
  if (target === 'latin') return cyrillicToLatin(text);
  return text;
}
