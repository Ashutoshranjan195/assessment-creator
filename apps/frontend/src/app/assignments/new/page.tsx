'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAssignmentForm } from '@/store/assignmentFormStore';
import { useJobStore } from '@/store/jobStore';
import { createAssignment } from '@/lib/api';
import type { QuestionType } from '@vedaai/shared';

const QUESTION_TYPES: QuestionType[] = ['MCQ', 'Short', 'Long'];

export default function NewAssignmentPage() {
  const router = useRouter();
  const form = useAssignmentForm();
  const jobStore = useJobStore();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors = form.validate();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'text/plain') {
      form.setField('sourceFileText', await file.text());
      return;
    }
    // For PDFs we keep this simple in the scaffold: prompt the user that
    // server-side extraction is recommended. The form still accepts text.
    if (file.type === 'application/pdf') {
      alert(
        'PDF upload selected — for production add server-side text extraction (e.g. pdf-parse). For now please paste extracted text in "Reference material" or upload a .txt file.',
      );
      return;
    }
    alert('Only .txt and .pdf files are supported.');
  }

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (errors.length > 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        title: form.title,
        subject: form.subject || undefined,
        className: form.className || undefined,
        school: form.school || undefined,
        timeAllowed: form.timeAllowed || undefined,
        dueDate: new Date(form.dueDate).toISOString(),
        questionTypes: form.questionTypes,
        additionalInstructions: form.additionalInstructions || undefined,
        sourceFileText: form.sourceFileText || undefined,
      };
      const { assignmentId, jobId } = await createAssignment(payload);
      jobStore.setQueued({ assignmentId, jobId });
      form.reset();
      router.push(`/assignments/${assignmentId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-5">
      <section className="px-1 sm:px-0">
        <div className="flex items-start gap-3 px-1">
          <span className="mt-3 h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.22)]" />
          <div>
            <h1 className="text-[1.4rem] sm:text-[1.55rem] font-semibold text-slate-800">Create Assignment</h1>
            <p className="text-sm text-slate-400">Set up a new assignment for your students</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-4 px-8 sm:px-24">
          <div className="h-1.5 rounded-full bg-slate-600" />
          <div className="h-1.5 rounded-full bg-slate-200" />
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.06)] sm:p-6 lg:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[1.35rem] font-semibold text-slate-800">Assignment Details</h2>
            <p className="text-sm text-slate-400">Basic information about your assignment</p>
          </div>
          <div className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:block">
            Step 1 of 2
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6" aria-busy={submitting}>
          <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50/80 p-5 sm:p-6">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                <UploadIcon />
              </div>
              <div>
                <p className="text-[15px] font-medium text-slate-700">Choose a file or drag & drop it here</p>
                <p className="mt-1 text-sm text-slate-400">PDF or text source material, up to 10MB</p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-[0_10px_20px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5">
                Browse Files
                <input type="file" accept=".pdf,.txt,text/plain,application/pdf" onChange={handleFile} className="sr-only" />
              </label>
            </div>
            <p className="mt-4 text-center text-sm text-slate-400">Upload images of your preferred document/image</p>
          </div>

          <div className="space-y-4">
            <Field label="Title *">
              <input
                className="input rounded-[18px] border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px]"
                value={form.title}
                onChange={(e) => form.setField('title', e.target.value)}
                placeholder="e.g. Algebra Mid-Term"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subject">
                <input
                  className="input rounded-[18px] border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px]"
                  value={form.subject}
                  onChange={(e) => form.setField('subject', e.target.value)}
                  placeholder="Mathematics"
                />
              </Field>
              <Field label="Class">
                <input
                  className="input rounded-[18px] border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px]"
                  value={form.className}
                  onChange={(e) => form.setField('className', e.target.value)}
                  placeholder="Grade 10"
                />
              </Field>
              <Field label="School">
                <input
                  className="input rounded-[18px] border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px]"
                  value={form.school}
                  onChange={(e) => form.setField('school', e.target.value)}
                  placeholder="VedaAI Sample School"
                />
              </Field>
              <Field label="Time allowed">
                <input
                  className="input rounded-[18px] border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px]"
                  value={form.timeAllowed}
                  onChange={(e) => form.setField('timeAllowed', e.target.value)}
                  placeholder="3 hours"
                />
              </Field>
            </div>

            <Field label="Due Date">
              <input
                type="datetime-local"
                className="input rounded-[18px] border-slate-200 bg-slate-50/80 px-4 py-3 text-[15px]"
                value={form.dueDate}
                onChange={(e) => form.setField('dueDate', e.target.value)}
              />
            </Field>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-slate-700">Question Types *</label>
                <button type="button" onClick={() => form.addQuestionType({ type: 'Short', count: 3, marksEach: 5 })} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_20px_rgba(0,0,0,0.14)]">
                  <PlusIcon />
                  Add Question Type
                </button>
              </div>

              <div className="space-y-3">
                {form.questionTypes.map((q, i) => (
                  <div key={i} className="grid grid-cols-1 gap-3 rounded-[22px] border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-[1fr_120px_120px_auto] sm:items-center">
                    <div className="grid gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Question Type</span>
                      <select
                        className="input rounded-[16px] border-slate-200 bg-white px-4 py-3 text-[15px]"
                        value={q.type}
                        onChange={(e) => form.updateQuestionType(i, { type: e.target.value as QuestionType })}
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">No. of Questions</span>
                      <input
                        type="number"
                        min={1}
                        className="input rounded-[16px] border-slate-200 bg-white px-4 py-3 text-[15px]"
                        value={q.count}
                        onChange={(e) => form.updateQuestionType(i, { count: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Marks</span>
                      <input
                        type="number"
                        min={1}
                        className="input rounded-[16px] border-slate-200 bg-white px-4 py-3 text-[15px]"
                        value={q.marksEach}
                        onChange={(e) => form.updateQuestionType(i, { marksEach: Number(e.target.value) })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => form.removeQuestionType(i)}
                      disabled={form.questionTypes.length <= 1}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                      aria-label="Remove question type"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-6 text-[15px] font-medium text-slate-700">
                <p>Total Questions : <span className="text-slate-900">{form.questionTypes.reduce((sum, item) => sum + item.count, 0)}</span></p>
                <p>Total Marks : <span className="text-slate-900">{form.questionTypes.reduce((sum, item) => sum + item.count * item.marksEach, 0)}</span></p>
              </div>
            </div>

            <Field label="Additional Information (For better output)">
              <textarea
                className="input min-h-[140px] rounded-[22px] border-slate-200 bg-slate-50/80 px-4 py-4 text-[15px]"
                value={form.additionalInstructions}
                onChange={(e) => form.setField('additionalInstructions', e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
              />
            </Field>

            <Field label="Reference material">
              <textarea
                className="input min-h-[110px] rounded-[22px] border-slate-200 bg-slate-50/80 px-4 py-4 text-[15px]"
                value={form.sourceFileText}
                onChange={(e) => form.setField('sourceFileText', e.target.value)}
                placeholder="Paste source text the AI should ground questions in (optional)."
              />
            </Field>
          </div>

          {errors.length > 0 && (
            <ul className="rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[15px] font-medium text-slate-700 shadow-[0_10px_20px_rgba(0,0,0,0.06)]"
            >
              <LeftArrowIcon />
              Previous
            </button>
            <button
              type="submit"
              disabled={submitting || errors.length > 0}
              className="inline-flex items-center justify-center rounded-full bg-[#171717] px-6 py-3 text-[15px] font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.22)] disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Next'}
              <RightArrowIcon />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
  inline,
}: {
  label: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <label className={inline ? 'flex flex-col text-xs text-slate-500' : 'block'}>
      <span className={inline ? 'mb-1' : 'block text-sm font-medium text-slate-700 mb-1'}>
        {label}
      </span>
      {children}
    </label>
  );
}

function UploadIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <path d="M12 16V5m0 0l-4 4m4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LeftArrowIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mr-2 h-4 w-4">
      <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RightArrowIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="ml-2 h-4 w-4">
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
