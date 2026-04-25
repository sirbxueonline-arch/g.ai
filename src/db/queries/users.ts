import { db } from '../client.js';
import type { Alphabet } from '../../lib/alphabet.js';

export interface UserRow {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  alphabet: Alphabet;
  is_premium: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertUserInput {
  telegram_id: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  language_code?: string | null;
}

export async function upsertUser(input: UpsertUserInput): Promise<UserRow> {
  const { data, error } = await db
    .from('users')
    .upsert(
      {
        telegram_id: input.telegram_id,
        username: input.username ?? null,
        first_name: input.first_name ?? null,
        last_name: input.last_name ?? null,
        language_code: input.language_code ?? null,
      },
      { onConflict: 'telegram_id', ignoreDuplicates: false },
    )
    .select()
    .single();

  if (error) throw new Error(`upsertUser failed: ${error.message}`);
  return data as UserRow;
}

export async function getUserByTelegramId(telegramId: number): Promise<UserRow | null> {
  const { data, error } = await db
    .from('users')
    .select()
    .eq('telegram_id', telegramId)
    .maybeSingle();

  if (error) throw new Error(`getUserByTelegramId failed: ${error.message}`);
  return data as UserRow | null;
}

export async function updateUserAlphabet(userId: string, alphabet: Alphabet): Promise<void> {
  const { error } = await db.from('users').update({ alphabet }).eq('id', userId);
  if (error) throw new Error(`updateUserAlphabet failed: ${error.message}`);
}
