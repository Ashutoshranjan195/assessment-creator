import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis';

const queue = new Queue('question-generation', { connection: redisConnection });
const queueEvents = new QueueEvents('question-generation', { connection: redisConnection });

export function getQueue() { return queue; }
export function getQueueEvents() { return queueEvents; }
