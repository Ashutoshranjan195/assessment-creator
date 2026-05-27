import 'dotenv/config';

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/vedaai',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  pdfStorageDir: process.env.PDF_STORAGE_DIR ?? './storage/pdfs',
  logLevel: process.env.LOG_LEVEL ?? 'info',

  llmProvider: (process.env.LLM_PROVIDER ?? 'mock') as 'openai' | 'anthropic' | 'mock',
  llmApiKey: process.env.LLM_API_KEY ?? '',
  llmModel: process.env.LLM_MODEL ?? 'gpt-4o-mini',
} as const;
