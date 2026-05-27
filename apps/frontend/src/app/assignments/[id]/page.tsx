'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  SocketEvents,
  type AssignmentDocument,
  type JobDonePayload,
  type JobFailedPayload,
  type JobProgressPayload,
  type JobQueuedPayload,
} from '@vedaai/shared';
import Skeleton from '@/components/Skeleton';
import { fetchAssignment, pdfUrl, regenerate } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useJobStore } from '@/store/jobStore';
import { QuestionPaper } from '@/components/QuestionPaper';

export default function AssignmentPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [assignment, setAssignment] = useState<AssignmentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const job = useJobStore();

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function load(): Promise<void> {
      try {
        const data = await fetchAssignment(id);
        if (!active) return;
        setAssignment(data);
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load');
        setLoading(false);
      }
    }
    void load();

    const socket = getSocket();
    socket.emit(SocketEvents.Subscribe, { assignmentId: id });

    const onQueued = (p: JobQueuedPayload): void => {
      if (p.assignmentId !== id) return;
      job.setQueued(p);
    };
    const onProgress = (p: JobProgressPayload): void => {
      if (p.assignmentId !== id) return;
      job.setProgress(p.progress, p.message);
    };
    const onDone = (p: JobDonePayload): void => {
      if (p.assignmentId !== id) return;
      job.setDone(p.resultUrl);
      void load();
    };
    const onFailed = (p: JobFailedPayload): void => {
      if (p.assignmentId !== id) return;
      job.setFailed(p.error);
      void load();
    };

    socket.on(SocketEvents.JobQueued, onQueued);
    socket.on(SocketEvents.JobProgress, onProgress);
    socket.on(SocketEvents.JobDone, onDone);
    socket.on(SocketEvents.JobFailed, onFailed);

    return () => {
      active = false;
      socket.emit(SocketEvents.Unsubscribe, { assignmentId: id });
      socket.off(SocketEvents.JobQueued, onQueued);
      socket.off(SocketEvents.JobProgress, onProgress);
      socket.off(SocketEvents.JobDone, onDone);
      socket.off(SocketEvents.JobFailed, onFailed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64" />
      </div>
    );
  if (error) return <p className="max-w-5xl mx-auto px-6 py-10 text-red-600">{error}</p>;
  if (!assignment) return null;

  const status = assignment.status;
  const showProgress =
    status === 'queued' || status === 'active' || job.status === 'queued' || job.status === 'active';

  async function onRegenerate(): Promise<void> {
    try {
      const { jobId, assignmentId } = await regenerate(id);
      job.setQueued({ jobId, assignmentId });
      const fresh = await fetchAssignment(id);
      setAssignment(fresh);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Regenerate failed');
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div className="no-print rounded-[28px] bg-[#2f2f2f] p-5 text-white shadow-[0_18px_40px_rgba(0,0,0,0.2)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-[17px] font-semibold leading-7 sm:text-[19px]">
              Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-100"
            >
              Regenerate
            </button>
            {status === 'completed' && (
              <a
                href={pdfUrl(id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-100"
              >
                Download as PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {showProgress && (
        <div className="no-print mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4" role="status" aria-live="polite">
          <p className="text-sm font-medium text-amber-800">
            {job.message ?? 'Working on your paper…'}
          </p>
          <div className="mt-2 w-full bg-amber-100 rounded-full h-2 overflow-hidden" aria-hidden="false">
            <div
              className="bg-amber-500 h-2 transition-all"
              style={{ width: `${Math.min(100, job.progress || 0)}%` }}
            />
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="no-print mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <strong>Generation failed.</strong> {assignment.errorMessage}
        </div>
      )}

      {assignment.generatedPaper ? (
        <div className="rounded-[28px] bg-white p-3 shadow-[0_16px_40px_rgba(0,0,0,0.08)] sm:p-4">
          <QuestionPaper paper={assignment.generatedPaper} />
        </div>
      ) : (
        !showProgress && (
          <p className="text-slate-500">No paper generated yet. Try regenerating.</p>
        )
      )}
    </section>
  );
}
