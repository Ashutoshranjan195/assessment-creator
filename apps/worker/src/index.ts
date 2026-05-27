import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from './config';
import { connectMongo } from './db';
import { logger } from './logger';
import { processGenerationJob, type GenerationJobData, type GenerationJobResult } from './processor';
import { shutdownBrowser } from './pdf';

const QUEUE_NAME = 'paper-generation';

async function main(): Promise<void> {
  await connectMongo();

  const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });
  const worker = new Worker<GenerationJobData, GenerationJobResult>(
    QUEUE_NAME,
    processGenerationJob,
    { connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2) },
  );

  worker.on('completed', (job) => logger.info({ jobId: job.id }, 'job completed'));
  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, err: err.message }, 'job failed'),
  );

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down worker');
    try {
      await worker.close();
      await shutdownBrowser();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  logger.info('worker ready');
}

main().catch((err) => {
  logger.error({ err }, 'fatal worker startup error');
  process.exit(1);
});
