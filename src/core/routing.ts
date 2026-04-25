export type ModelTier = 'default' | 'cheap' | 'vision';

export interface RoutingDecision {
  provider: 'anthropic' | 'openai';
  model: string;
  tier: ModelTier;
}

const DEFAULT_MODEL = process.env['MODEL_DEFAULT'] ?? 'claude-sonnet-4-6';
const CHEAP_MODEL = process.env['MODEL_CHEAP'] ?? 'claude-haiku-4-5-20251001';

export function routeRequest(opts: {
  hasImage: boolean;
  isHighDailyUser: boolean;
  forceModel?: string;
}): RoutingDecision {
  if (opts.forceModel) {
    return { provider: 'anthropic', model: opts.forceModel, tier: 'default' };
  }

  // Vision queries always go to Anthropic — it wins on Azerbaijani form parsing
  if (opts.hasImage) {
    return { provider: 'anthropic', model: DEFAULT_MODEL, tier: 'vision' };
  }

  // Users who've burned most of their daily budget get downgraded to cheap tier
  if (opts.isHighDailyUser) {
    return { provider: 'anthropic', model: CHEAP_MODEL, tier: 'cheap' };
  }

  return { provider: 'anthropic', model: DEFAULT_MODEL, tier: 'default' };
}
