import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { logger } from '../lib/logger.js';
import { LLMError } from '../lib/errors.js';
import { routeRequest } from './routing.js';

const anthropic = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });

const TIMEOUT_MS = parseInt(process.env['MODEL_FALLBACK_TIMEOUT_MS'] ?? '5000', 10);

function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateOptions {
  messages: Message[];
  hasImage?: boolean;
  isHighDailyUser?: boolean;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface GenerateResult {
  content: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
}

export async function generateResponse(opts: GenerateOptions): Promise<GenerateResult> {
  const decision = routeRequest({
    hasImage: opts.hasImage ?? false,
    isHighDailyUser: opts.isHighDailyUser ?? false,
  });

  const start = Date.now();

  try {
    if (decision.provider === 'anthropic') {
      return await callAnthropic(decision.model, opts, start);
    }
    return await callOpenAI(decision.model, opts, start);
  } catch (err) {
    logger.warn('Primary LLM call failed, trying fallback', {
      model: decision.model,
      error: err instanceof Error ? err.message : String(err),
    });

    // Single retry on the other provider
    try {
      if (decision.provider === 'anthropic') {
        return await callOpenAI('gpt-4o-mini', opts, start);
      }
      return await callAnthropic('claude-haiku-4-5-20251001', opts, start);
    } catch (fallbackErr) {
      throw new LLMError(decision.provider, fallbackErr);
    }
  }
}

async function callAnthropic(
  model: string,
  opts: GenerateOptions,
  start: number,
): Promise<GenerateResult> {
  const messages: Anthropic.MessageParam[] = opts.messages.map(m => {
    if (m.role === 'user' && opts.hasImage && opts.imageBase64 && opts.imageMimeType) {
      return {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: opts.imageMimeType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: opts.imageBase64,
            },
          },
          { type: 'text', text: m.content },
        ],
      };
    }
    return { role: m.role, content: m.content };
  });

  const withTimeout = Promise.race([
    anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: getSystemPrompt(),
      messages,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Anthropic timeout')), TIMEOUT_MS),
    ),
  ]);

  const response = await withTimeout;
  const content = response.content[0];
  if (!content || content.type !== 'text') throw new LLMError('anthropic', 'no text content');

  return {
    content: content.text,
    model,
    tokensIn: response.usage.input_tokens,
    tokensOut: response.usage.output_tokens,
    latencyMs: Date.now() - start,
  };
}

async function callOpenAI(
  model: string,
  opts: GenerateOptions,
  start: number,
): Promise<GenerateResult> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: getSystemPrompt() },
    ...opts.messages.map(m => ({ role: m.role, content: m.content })),
  ];

  const withTimeout = Promise.race([
    openai.chat.completions.create({ model, messages, max_tokens: 1024 }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('OpenAI timeout')), TIMEOUT_MS),
    ),
  ]);

  const response = await withTimeout;
  const choice = response.choices[0];
  if (!choice?.message.content) throw new LLMError('openai', 'no content');

  return {
    content: choice.message.content,
    model,
    tokensIn: response.usage?.prompt_tokens ?? 0,
    tokensOut: response.usage?.completion_tokens ?? 0,
    latencyMs: Date.now() - start,
  };
}
