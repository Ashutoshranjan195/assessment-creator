'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionTypeSpec } from '@vedaai/shared';

export interface AssignmentFormState {
  title: string;
  subject: string;
  className: string;
  school: string;
  timeAllowed: string;
  dueDate: string; // ISO yyyy-mm-ddThh:mm
  questionTypes: QuestionTypeSpec[];
  additionalInstructions: string;
  sourceFileText: string;
  setField: <K extends keyof Omit<AssignmentFormState, 'setField' | 'addQuestionType' | 'updateQuestionType' | 'removeQuestionType' | 'reset' | 'validate'>>(
    key: K,
    value: AssignmentFormState[K],
  ) => void;
  addQuestionType: (q: QuestionTypeSpec) => void;
  updateQuestionType: (idx: number, q: Partial<QuestionTypeSpec>) => void;
  removeQuestionType: (idx: number) => void;
  reset: () => void;
  validate: () => string[];
}

const defaults: Omit<
  AssignmentFormState,
  'setField' | 'addQuestionType' | 'updateQuestionType' | 'removeQuestionType' | 'reset' | 'validate'
> = {
  title: '',
  subject: '',
  className: '',
  school: '',
  timeAllowed: '3 hours',
  dueDate: '',
  questionTypes: [{ type: 'MCQ', count: 5, marksEach: 2 }],
  additionalInstructions: '',
  sourceFileText: '',
};

export const useAssignmentForm = create<AssignmentFormState>()(
  persist(
    (set, get) => ({
      ...defaults,
      setField: (key, value) => set({ [key]: value } as Partial<AssignmentFormState>),
      addQuestionType: (q) => set({ questionTypes: [...get().questionTypes, q] }),
      updateQuestionType: (idx, q) =>
        set({
          questionTypes: get().questionTypes.map((it, i) => (i === idx ? { ...it, ...q } : it)),
        }),
      removeQuestionType: (idx) =>
        set({ questionTypes: get().questionTypes.filter((_, i) => i !== idx) }),
      reset: () => set({ ...defaults }),
      validate: () => {
        const s = get();
        const errs: string[] = [];
        if (!s.title.trim()) errs.push('Title is required');
        if (!s.dueDate) errs.push('Due date is required');
        else if (new Date(s.dueDate).getTime() <= Date.now())
          errs.push('Due date must be in the future');
        if (s.questionTypes.length === 0) errs.push('At least one question type is required');
        s.questionTypes.forEach((q, i) => {
          if (!q.count || q.count <= 0) errs.push(`Question type #${i + 1}: count must be > 0`);
          if (!q.marksEach || q.marksEach <= 0)
            errs.push(`Question type #${i + 1}: marks must be > 0`);
        });
        return errs;
      },
    }),
    { name: 'vedaai-assignment-form' },
  ),
);
