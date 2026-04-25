import { db } from '../client.js';

export interface UsageRow {
  id: string;
  user_id: string;
  date: string;
  message_count: number;
  voice_seconds: number;
  document_count: number;
  tokens_total: number;
}

export async function getDailyUsage(userId: string): Promise<UsageRow | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await db
    .from('usage_daily')
    .select()
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) throw new Error(`getDailyUsage failed: ${error.message}`);
  return data as UsageRow | null;
}

export async function incrementUsage(
  userId: string,
  field: 'message_count' | 'document_count',
  amount = 1,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await db.rpc('increment_usage', {
    p_user_id: userId,
    p_date: today,
    p_field: field,
    p_amount: amount,
  });
  if (error) throw new Error(`incrementUsage failed: ${error.message}`);
}

export async function incrementVoiceSeconds(userId: string, seconds: number): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await db.rpc('increment_usage', {
    p_user_id: userId,
    p_date: today,
    p_field: 'voice_seconds',
    p_amount: seconds,
  });
  if (error) throw new Error(`incrementVoiceSeconds failed: ${error.message}`);
}

export async function incrementTokens(userId: string, tokens: number): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await db.rpc('increment_usage', {
    p_user_id: userId,
    p_date: today,
    p_field: 'tokens_total',
    p_amount: tokens,
  });
  if (error) throw new Error(`incrementTokens failed: ${error.message}`);
}
