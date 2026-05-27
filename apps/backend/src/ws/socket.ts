import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import {
  SocketEvents,
  type JobDonePayload,
  type JobFailedPayload,
  type JobProgressPayload,
  type JobQueuedPayload,
  type SubscribePayload,
} from '@vedaai/shared';
import { config } from '../config';
import { logger } from '../logger';
import { getQueue, getQueueEvents } from '../queue/generationQueue';

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: { origin: config.corsOrigin, methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket: Socket) => {
    logger.debug({ id: socket.id }, 'socket connected');

    socket.on(SocketEvents.Subscribe, (payload: SubscribePayload) => {
      if (!payload?.assignmentId) return;
      const room = roomFor(payload.assignmentId);
      void socket.join(room);
      logger.debug({ id: socket.id, room }, 'socket joined room');
    });

    socket.on(SocketEvents.Unsubscribe, (payload: SubscribePayload) => {
      if (!payload?.assignmentId) return;
      void socket.leave(roomFor(payload.assignmentId));
    });

    socket.on('disconnect', () => {
      logger.debug({ id: socket.id }, 'socket disconnected');
    });
  });

  attachQueueListeners();

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialised');
  return io;
}

export function emitJobQueued(payload: JobQueuedPayload): void {
  getIO().to(roomFor(payload.assignmentId)).emit(SocketEvents.JobQueued, payload);
}
export function emitJobProgress(payload: JobProgressPayload): void {
  getIO().to(roomFor(payload.assignmentId)).emit(SocketEvents.JobProgress, payload);
}
export function emitJobDone(payload: JobDonePayload): void {
  getIO().to(roomFor(payload.assignmentId)).emit(SocketEvents.JobDone, payload);
}
export function emitJobFailed(payload: JobFailedPayload): void {
  getIO().to(roomFor(payload.assignmentId)).emit(SocketEvents.JobFailed, payload);
}

function roomFor(assignmentId: string): string {
  return `assignment:${assignmentId}`;
}

/**
 * Forward BullMQ queue events to socket.io rooms so the frontend can render
 * progress without polling. The worker calls `job.updateProgress({ ... })`
 * with `{ progress, message, assignmentId }`.
 */
function attachQueueListeners(): void {
  const queue = getQueue();
  const events = getQueueEvents();

  events.on('progress', async ({ jobId, data }) => {
    const progress = typeof data === 'number' ? data : (data as { progress?: number })?.progress;
    const message = typeof data === 'object' ? (data as { message?: string })?.message : undefined;
    const assignmentId = await resolveAssignmentId(jobId);
    if (!assignmentId) return;
    emitJobProgress({
      jobId,
      assignmentId,
      progress: Number(progress ?? 0),
      message,
    });
  });

  events.on('completed', async ({ jobId, returnvalue }) => {
    const result = safeJson<{ assignmentId?: string; resultUrl?: string }>(returnvalue);
    const assignmentId = result?.assignmentId ?? (await resolveAssignmentId(jobId));
    const resultUrl = result?.resultUrl ?? '';
    if (!assignmentId) return;
    emitJobDone({ jobId, assignmentId, resultUrl });
  });

  events.on('failed', async ({ jobId, failedReason }) => {
    const assignmentId = await resolveAssignmentId(jobId);
    if (!assignmentId) return;
    emitJobFailed({ jobId, assignmentId, error: failedReason ?? 'unknown error' });
  });

  async function resolveAssignmentId(jobId: string): Promise<string | undefined> {
    const job = await queue.getJob(jobId);
    return (job?.data as { assignmentId?: string } | undefined)?.assignmentId;
  }
}

function safeJson<T>(value: unknown): T | undefined {
  if (value && typeof value === 'object') return value as T;
  if (typeof value !== 'string') return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}
