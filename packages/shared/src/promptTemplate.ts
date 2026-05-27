import type { AssignmentInput } from './types';

/**
 * Strict prompt template used by the worker.
 *
 * Two messages are returned: a `system` message that pins behaviour, and a
 * `user` message containing the assignment input. The LLM MUST return only a
 * single JSON object matching the shared `questionPaperSchema`.
 */
export interface PromptMessages {
  system: string;
  user: string;
}

const baseSystemPrompt = `You are VedaAI, an expert assessment generator for K-12 and undergraduate teachers.

Your sole job is to produce a complete, well-structured question paper as a
single JSON object that matches the schema given by the user. You MUST follow
ALL of these rules:

1. Output ONLY one JSON object. No prose, no markdown fences, no commentary,
   no leading or trailing whitespace beyond the object itself.
2. The JSON MUST validate against the schema provided in the user message.
3. Group questions into sections labelled "Section A", "Section B", etc.
4. Each question MUST have:
   - "id" — short stable identifier like "Q1", "Q2", ...
   - "text" — the question wording, self-contained.
   - "difficulty" — one of: "Easy", "Moderate", "Challenging".
   - "marks" — positive integer.
   - "options" — REQUIRED for MCQ-style questions, OMITTED otherwise.
5. The sum of marks across all questions MUST equal "header.maxMarks".
6. "studentInfo" MUST include at least: "Name", "Roll Number", "Class",
   "Section".
7. Use plain text only. No HTML, no LaTeX, no Markdown.
8. If you cannot satisfy the constraints, still return a best-effort JSON
   object that matches the schema. Never apologise; never return prose.`;

const stricterSuffix = `

CRITICAL RETRY NOTICE: Your previous response failed JSON-schema validation.
Re-examine the schema. Output ONLY the JSON object, with every required
field present and correctly typed. Do not include any explanation.`;

export function buildPrompt(
  input: AssignmentInput,
  jsonSchema: unknown,
  options?: { stricter?: boolean },
): PromptMessages {
  const system = options?.stricter ? baseSystemPrompt + stricterSuffix : baseSystemPrompt;

  const totalQuestions = input.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = input.questionTypes.reduce((s, q) => s + q.count * q.marksEach, 0);

  const typeBreakdown = input.questionTypes
    .map((q) => `- ${q.count} ${q.type} question(s) at ${q.marksEach} mark(s) each`)
    .join('\n');

  const user = `Generate a question paper as a single JSON object matching this schema:

\`\`\`json
${JSON.stringify(jsonSchema, null, 2)}
\`\`\`

Assignment specification:
- Title: ${input.title}
- Subject: ${input.subject ?? 'General'}
- Class: ${input.className ?? 'Not specified'}
- School: ${input.school ?? 'VedaAI Sample School'}
- Time allowed: ${input.timeAllowed ?? '3 hours'}
- Due date (for reference only, not in paper): ${input.dueDate}
- Total questions: ${totalQuestions}
- Total marks: ${totalMarks}
- Question type breakdown:
${typeBreakdown}
- Additional instructions: ${input.additionalInstructions ?? 'None'}

${
  input.sourceFileText
    ? `Reference material (use it to ground the questions; do not copy verbatim):\n"""\n${input.sourceFileText.slice(0, 4000)}\n"""`
    : 'No reference material supplied; generate based on the subject and class level.'
}

Remember: ONLY return the JSON object. Nothing else.`;

  return { system, user };
}
