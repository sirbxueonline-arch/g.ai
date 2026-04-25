import { db } from '../client.js';

export interface MessageRow {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  content_type: 'text' | 'voice' | 'document' | 'photo';
  model_used: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  latency_ms: number | null;
  created_at: string;
}

export interface InsertMessageInput {
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  content_type?: 'text' | 'voice' | 'document' | 'photo';
  model_used?: string;
  tokens_in?: number;
  tokens_out?: number;
  latency_ms?: number;
}

export async function insertMessage(input: InsertMessageInput): Promise<MessageRow> {
  const { data, error } = await db
    .from('messages')
    .insert({
      conversation_id: input.conversation_id,
      user_id: input.user_id,
      role: input.role,
      content: input.content,
      content_type: input.content_type ?? 'text',
      model_used: input.model_used ?? null,
      tokens_in: input.tokens_in ?? null,
      tokens_out: input.tokens_out ?? null,
      latency_ms: input.latency_ms ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`insertMessage failed: ${error.message}`);
  return data as MessageRow;
}

export async function getConversationHistory(
  conversationId: string,
  limit = 20,
): Promise<MessageRow[]> {
  const { data, error } = await db
    .from('messages')
    .select()
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`getConversationHistory failed: ${error.message}`);
  return data as MessageRow[];
}
