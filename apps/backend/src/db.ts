import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './logger';

export async function connectMongo(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });
  logger.info({ uri: redact(config.mongoUri) }, 'mongo connected');
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

function redact(uri: string): string {
  return uri.replace(/\/\/([^@]+)@/, '//***:***@');
}
