/**
 * Structured logger for API routes.
 *
 * Outputs JSON-formatted log lines with consistent fields for
 * easy parsing by log aggregation tools (CloudWatch, Datadog, etc.).
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('User logged in', { userId: '...', role: 'STUDENT' });
 *   logger.error('Query failed', { route: '/api/fees', error: err.message });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level — controlled by env var, defaults to 'info' in production
const MIN_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta && sanitizeMeta(meta)),
  };
}

/** Strip sensitive fields from metadata to prevent accidental PII leaks */
function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const REDACTED_KEYS = ['password', 'password_hash', 'token', 'secret', 'otp', 'authorization'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (REDACTED_KEYS.some((rk) => key.toLowerCase().includes(rk))) {
      sanitized[key] = '[REDACTED]';
    } else if (value instanceof Error) {
      sanitized[key] = { message: value.message, name: value.name };
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry = formatEntry(level, message, meta);

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON output for log aggregation
    const output = JSON.stringify(entry);
    if (level === 'error') {
      process.stderr.write(output + '\n');
    } else {
      process.stdout.write(output + '\n');
    }
  } else {
    // Human-readable output for development
    const color = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' }[level];
    const reset = '\x1b[0m';
    const metaStr = meta ? ` ${JSON.stringify(sanitizeMeta(meta))}` : '';
    console.log(`${color}[${level.toUpperCase()}]${reset} ${message}${metaStr}`);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
};
