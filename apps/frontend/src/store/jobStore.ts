'use client';

import { create } from 'zustand';

export interface JobState {
  assignmentId?: string;
  jobId?: string;
  status: 'idle' | 'queued' | 'active' | 'completed' | 'failed';
  progress: number;
  message?: string;
  resultUrl?: string;
  error?: string;
  setQueued: (a: { jobId: string; assignmentId: string }) => void;
  setProgress: (p: number, message?: string) => void;
  setDone: (resultUrl: string) => void;
  setFailed: (error: string) => void;
  reset: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  status: 'idle',
  progress: 0,
  setQueued: ({ jobId, assignmentId }) =>
    set({ jobId, assignmentId, status: 'queued', progress: 0, message: 'Queued', error: undefined }),
  setProgress: (progress, message) => set({ status: 'active', progress, message }),
  setDone: (resultUrl) => set({ status: 'completed', progress: 100, resultUrl }),
  setFailed: (error) => set({ status: 'failed', error }),
  reset: () =>
    set({
      assignmentId: undefined,
      jobId: undefined,
      status: 'idle',
      progress: 0,
      message: undefined,
      resultUrl: undefined,
      error: undefined,
    }),
}));
