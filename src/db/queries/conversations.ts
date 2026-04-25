import { db } from '../client.js';

export interface ConversationRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export async function getOrCreateConversation(userId: string): Promise<ConversationRow> {
  // Re-use open conversation from today
  const today = new Date().toISOString().slice(0, 10);
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
