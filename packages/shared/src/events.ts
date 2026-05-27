/**
 * Socket.IO event contract shared between backend and frontend.
 *
 * Rooms:
 *   - Each assignment has its own room: `assignment:<assignmentId>`.
 *   - The frontend joins a room with the `subscribe` event after navigating
 *     to an assignment detail / output page.
 */

export const SocketEvents = {
  Subscribe: 'subscribe',
  Unsubscribe: 'unsubscribe',
  JobQueued: 'job:queued',
  JobProgress: 'job:progress',
  JobDone: 'job:done',
  JobFailed: 'job:failed',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];

export interface SubscribePayload {
  assignmentId: string;
}

export interface JobQueuedPayload {
  jobId: string;
  assignmentId: string;
}

export interface JobProgressPayload {
  jobId: string;
  assignmentId: string;
  progress: number; // 0-100
  message?: string;
}

export interface JobDonePayload {
  jobId: string;
  assignmentId: string;
  resultUrl: string;
}

export interface JobFailedPayload {
  jobId: string;
  assignmentId: string;
  error: string;
}
