export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class RateLimitError extends AppError {
  constructor(userId: number, resource: string) {
    super(`Rate limit exceeded for ${resource}`, 'RATE_LIMIT_EXCEEDED', { userId, resource });
    this.name = 'RateLimitError';
  }
}

export class LLMError extends AppError {
  constructor(provider: string, cause: unknown) {
    super(`LLM call failed on ${provider}`, 'LLM_ERROR', {
      provider,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
    this.name = 'LLMError';
  }
}

export class SpeechError extends AppError {
  constructor(operation: 'stt' | 'tts', cause: unknown) {
    super(`Speech ${operation} failed`, 'SPEECH_ERROR', {
      operation,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
    this.name = 'SpeechError';
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
