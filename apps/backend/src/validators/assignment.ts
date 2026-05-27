import { z } from 'zod';

const questionTypeSpec = z.object({
  type: z.enum(['MCQ', 'Short', 'Long']),
  count: z.number().int().positive(),
  marksEach: z.number().int().positive(),
});

export const createAssignmentSchema = z
  .object({
    title: z.string().trim().min(1, 'title is required').max(200),
    subject: z.string().trim().max(120).optional(),
    className: z.string().trim().max(60).optional(),
    school: z.string().trim().max(160).optional(),
    timeAllowed: z.string().trim().max(60).optional(),
    dueDate: z
      .string()
      .datetime({ offset: true })
      .refine((s) => new Date(s).getTime() > Date.now(), 'dueDate must be in the future'),
    questionTypes: z.array(questionTypeSpec).min(1, 'at least one question type required'),
    additionalInstructions: z.string().max(2000).optional(),
    sourceFileText: z.string().max(50_000).optional(),
  })
  .strict();

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
