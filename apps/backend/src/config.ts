import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.BACKEND_PORT ?? 4000),
  mongoUri: required('MONGODB_URI', 'mongodb://localhost:27017/vedaai'),
  redisUrl: required('REDIS_URL', 'redis://localhost:6379'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  pdfStorageDir: process.env.PDF_STORAGE_DIR ?? './storage/pdfs',
  logLevel: process.env.LOG_LEVEL ?? 'info',
} as const;

export const isProd = config.nodeEnv === 'production';
