import type { Job } from 'bullmq';
import {
  buildPrompt,
  questionPaperSchema,
  type AssignmentInput,
} from '@vedaai/shared';
import { Assignment } from './db';
import { callLLM } from './llm';
import { parseLLMResponse } from './validator';
import { generatePdf } from './pdf';
import { logger } from './logger';

export interface GenerationJobData {
  assignmentId: string;
  attempt: number;
  stricter?: boolean;
}

export interface GenerationJobResult {
  assignmentId: string;
  resultUrl: string;
}

const MAX_INTERNAL_RETRIES = 2;

export async function processGenerationJob(
  job: Job<GenerationJobData, GenerationJobResult>,
): Promise<GenerationJobResult> {
  const { assignmentId } = job.data;
  logger.info({ jobId: job.id, assignmentId }, 'processing job');

  const doc = await Assignment.findById(assignmentId);
  if (!doc) throw new Error(`Assignment ${assignmentId} not found`);

  doc.status = 'active';
  await doc.save();
  await job.updateProgress({ progress: 5, message: 'Building prompt' });

  const input = toAssignmentInput(doc);

  let stricter = false;
  let lastErrors: string[] = [];
  let rawResponse = '';
  for (let attempt = 0; attempt <= MAX_INTERNAL_RETRIES; attempt++) {
    await job.updateProgress({
      progress: 10 + attempt * 20,
      message: `Calling LLM (attempt ${attempt + 1}/${MAX_INTERNAL_RETRIES + 1})`,
    });
    const prompt = buildPrompt(input, questionPaperSchema, { stricter });
    rawResponse = await callLLM(prompt, { temperature: stricter ? 0.1 : 0.4 });

    await job.updateProgress({
      progress: 40 + attempt * 20,
      message: 'Validating LLM output',
    });

    const result = parseLLMResponse(rawResponse);
    if (result.ok && result.paper) {
      doc.generatedPaper = result.paper;
      doc.attempts = attempt + 1;
      await doc.save();
      lastErrors = [];
      break;
    }
    lastErrors = result.errors ?? ['unknown validation error'];
    logger.warn({ assignmentId, attempt, errors: lastErrors }, 'invalid LLM output');
    stricter = true;
  }

  if (lastErrors.length > 0) {
    // Persist raw output for offline debugging (NOT exposed via API).
    doc.status = 'failed';
    doc.errorMessage = `LLM output failed validation: ${lastErrors.join('; ')}`;
    doc.rawLlmOutput = rawResponse;
    await doc.save();
    throw new Error(doc.errorMessage);
  }

  await job.updateProgress({ progress: 75, message: 'Rendering PDF' });
  const pdfPath = await generatePdf(String(doc._id));
  doc.pdfPath = pdfPath;
  doc.status = 'completed';
  await doc.save();

  await job.updateProgress({ progress: 100, message: 'Done' });
  return {
    assignmentId: String(doc._id),
    resultUrl: `/api/assignments/${String(doc._id)}/pdf`,
  };
}

function toAssignmentInput(doc: {
  title: string;
  subject?: string;
  className?: string;
  school?: string;
  timeAllowed?: string;
  dueDate: Date;
  questionTypes: { type: 'MCQ' | 'Short' | 'Long'; count: number; marksEach: number }[];
  additionalInstructions?: string;
  sourceFileText?: string;
}): AssignmentInput {
  return {
    title: doc.title,
    subject: doc.subject,
    className: doc.className,
    school: doc.school,
    timeAllowed: doc.timeAllowed,
    dueDate: doc.dueDate.toISOString(),
    questionTypes: doc.questionTypes,
    additionalInstructions: doc.additionalInstructions,
    sourceFileText: doc.sourceFileText,
  };
}
