type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function currentLevel(): LogLevel {
  const env = process.env['LOG_LEVEL'] ?? 'info';
  return (env as LogLevel) in LEVELS ? (env as LogLevel) : 'info';
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (LEVELS[level] < LEVELS[currentLevel()]) return;

  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(context ?? {}),
  };

  const line = JSON.stringify(entry);
  if (level === 'error') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

export const logger = {
  debug: (message: string, ctx?: Record<string, unknown>) => log('debug', message, ctx),
  info: (message: string, ctx?: Record<string, unknown>) => log('info', message, ctx),
  warn: (message: string, ctx?: Record<string, unknown>) => log('warn', message, ctx),
  error: (message: string, ctx?: Record<string, unknown>) => log('error', message, ctx),
};
