import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { questionPaperSchema, type GeneratedQuestionPaper } from '@vedaai/shared';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const compiled: ValidateFunction<GeneratedQuestionPaper> = ajv.compile(questionPaperSchema);

export interface ParseResult {
  ok: boolean;
  paper?: GeneratedQuestionPaper;
  errors?: string[];
}

/**
 * Parse and validate an LLM response. The LLM is instructed to return ONLY a
 * JSON object, but in practice some models still wrap output in markdown
 * fences or include trailing prose — we defensively strip those.
 */
export function parseLLMResponse(raw: string): ParseResult {
  const candidate = extractJsonObject(raw);
  if (!candidate) {
    return { ok: false, errors: ['no JSON object found in response'] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (err) {
    return { ok: false, errors: [`JSON parse error: ${(err as Error).message}`] };
  }
  const valid = compiled(parsed);
  if (!valid) {
    const errors = (compiled.errors ?? []).map(
      (e) => `${e.instancePath || '/'} ${e.message ?? 'invalid'}`,
    );
    return { ok: false, errors };
  }
  // Cross-field: sum of marks across sections should equal header.maxMarks.
  const paper = parsed as GeneratedQuestionPaper;
  const sumMarks = paper.sections.reduce(
    (s, sec) => s + sec.questions.reduce((q, qn) => q + qn.marks, 0),
    0,
  );
  if (sumMarks !== paper.header.maxMarks) {
    return {
      ok: false,
      errors: [
        `sum of question marks (${sumMarks}) does not equal header.maxMarks (${paper.header.maxMarks})`,
      ],
    };
  }
  return { ok: true, paper };
}

function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim();
  // Strip ```json ... ``` fences if present
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1].trim() : trimmed;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return body.slice(start, end + 1);
}
