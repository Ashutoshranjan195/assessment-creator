import { Queue, QueueEvents, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';

export const QUEUE_NAME = 'paper-generation';

// Lazily-initialised so tests that don't need Redis can import this module.
let connection: ConnectionOptions | null = null;
let queue: Queue | null = null;
let queueEvents: QueueEvents | null = null;

function getConnection(): ConnectionOptions {
  if (connection) return connection;
  connection = {
    // BullMQ accepts a URL via the underlying ioredis options.
    // Using a connection factory here keeps us flexible for managed Redis providers.
    host: undefined,
    port: undefined,
  } as ConnectionOptions;
  return connection;
}

export function getQueue(): Queue {
  if (queue) return queue;
  queue = new Queue(QUEUE_NAME, {
    connection: createRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 24 * 3600 },
    },
  });
  return queue;
}

export function getQueueEvents(): QueueEvents {
  if (queueEvents) return queueEvents;
  queueEvents = new QueueEvents(QUEUE_NAME, { connection: createRedis() });
  return queueEvents;
}

function createRedis(): IORedis {
  return new IORedis(config.redisUrl, { maxRetriesPerRequest: null });
}

// Stop unused-warning for the lazy connection helper which we keep for future use.
void getConnection;

export interface GenerationJobData {
  assignmentId: string;
  attempt: number;
  stricter?: boolean;
}
