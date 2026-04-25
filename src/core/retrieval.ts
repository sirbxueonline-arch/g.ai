import OpenAI from 'openai';
import { db } from '../db/client.js';
import { logger } from '../lib/logger.js';

const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });

export interface KnowledgeChunk {
  id: string;
  source: string;
  content: string;
  similarity: number;
}

export async function retrieveRelevantChunks(
  query: string,
  limit = 3,
): Promise<KnowledgeChunk[]> {
  try {
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const embedding = embeddingRes.data[0]?.embedding;
    if (!embedding) return [];

    const { data, error } = await db.rpc('match_knowledge_chunks', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
    });

    if (error) {
      logger.warn('Knowledge retrieval failed', { error: error.message });
      return [];
    }

    return (data ?? []) as KnowledgeChunk[];
  } catch (err) {
    logger.warn('Knowledge retrieval error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}
