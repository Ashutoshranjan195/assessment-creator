/**
 * Strict JSON schema for the LLM's question-paper response.
 *
 * The worker uses AJV to validate the LLM output against this schema before
 * persisting it. Do NOT loosen this schema without updating the prompt and
 * downstream renderers.
 */
export const questionPaperSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'GeneratedQuestionPaper',
  type: 'object',
  required: ['header', 'studentInfo', 'sections'],
  additionalProperties: false,
  properties: {
    header: {
      type: 'object',
      required: ['school', 'subject', 'class', 'timeAllowed', 'maxMarks'],
      additionalProperties: false,
      properties: {
        school: { type: 'string', minLength: 1 },
        subject: { type: 'string', minLength: 1 },
        class: { type: 'string', minLength: 1 },
        timeAllowed: { type: 'string', minLength: 1 },
        maxMarks: { type: 'integer', minimum: 1 },
      },
    },
    studentInfo: {
      type: 'array',
      minItems: 1,
      items: { type: 'string', minLength: 1 },
    },
    sections: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['title', 'instruction', 'questions'],
        additionalProperties: false,
        properties: {
          title: { type: 'string', minLength: 1 },
          instruction: { type: 'string', minLength: 1 },
          questions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['id', 'text', 'difficulty', 'marks'],
              additionalProperties: false,
              properties: {
                id: { type: 'string', minLength: 1 },
                text: { type: 'string', minLength: 1 },
                difficulty: { enum: ['Easy', 'Moderate', 'Challenging'] },
                marks: { type: 'integer', minimum: 1 },
                options: {
                  type: 'array',
                  items: { type: 'string', minLength: 1 },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
