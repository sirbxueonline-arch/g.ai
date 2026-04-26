import { db } from '../client.js';

export interface ConversationRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

function bakuToday(): string {
  // Baku is UTC+4; avoid splitting the day at 20:00 Baku time
  return new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export async function getOrCreateConversation(userId: string): Promise<ConversationRow> {
  // Re-use open conversation from today (Baku time)
  const today = bakuToday();
  const { data: existing, error: fetchErr } = await db
    .from('conversations')
    .select()
    .eq('user_id', userId)
    .is('ended_at', null)
    .gte('started_at', today)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchErr) throw new Error(`getOrCreateConversation fetch failed: ${fetchErr.message}`);
  if (existing) return existing as ConversationRow;

  const { data, error } = await db
    .from('conversations')
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw new Error(`getOrCreateConversation insert failed: ${error.message}`);
  return data as ConversationRow;
}
