import { config } from './config';
import { logger } from './logger';
import type { PromptMessages } from '@vedaai/shared';

export interface LlmOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Provider-agnostic LLM call.
 *
 * Returns the raw assistant text. Caller is responsible for parsing JSON.
 *
 * Providers:
 *   - "mock"     — returns a deterministic sample JSON string (used in tests
 *                  and when LLM_API_KEY is not yet provided).
 *   - "openai"   — uses OpenAI Chat Completions REST API.
 *   - "anthropic"— uses Anthropic Messages REST API.
 *
 * TODO (user): supply LLM_API_KEY in .env and switch LLM_PROVIDER away from
 * "mock" to integrate a real provider.
 */
export async function callLLM(prompt: PromptMessages, opts: LlmOptions = {}): Promise<string> {
  const provider = config.llmProvider;
  logger.debug({ provider }, 'callLLM invoked');

  if (provider === 'mock') return mockResponse();

  if (!config.llmApiKey) {
    throw new Error(`LLM_API_KEY is not set; required for provider "${provider}"`);
  }

  switch (provider) {
    case 'openai':
      return callOpenAI(prompt, opts);
    case 'anthropic':
      return callAnthropic(prompt, opts);
    default:
      throw new Error(`Unsupported LLM provider: ${provider satisfies never}`);
  }
}

async function callOpenAI(prompt: PromptMessages, opts: LlmOptions): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.llmApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model ?? config.llmModel,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 2400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI HTTP ${res.status}: ${body.slice(0, 500)}`);
  }
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned no content');
  return content;
}

async function callAnthropic(prompt: PromptMessages, opts: LlmOptions): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.llmApiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model ?? config.llmModel,
      max_tokens: opts.maxTokens ?? 2400,
      temperature: opts.temperature ?? 0.4,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic HTTP ${res.status}: ${body.slice(0, 500)}`);
  }
  const json = (await res.json()) as {
    content?: { type?: string; text?: string }[];
  };
  const text = json.content?.find((c) => c.type === 'text')?.text;
  if (!text) throw new Error('Anthropic returned no text content');
  return text;
}

function mockResponse(): string {
  // Deterministic, schema-valid sample paper used for local dev and tests.
  return JSON.stringify({
    header: {
      school: 'VedaAI Sample School',
      subject: 'Mathematics',
      class: 'Grade 10',
      timeAllowed: '3 hours',
      maxMarks: 30,
    },
    studentInfo: ['Name', 'Roll Number', 'Class', 'Section'],
    sections: [
      {
        title: 'Section A',
        instruction: 'Attempt all questions. Each question carries 2 marks.',
        questions: [
          {
            id: 'Q1',
            text: 'Which of the following is a prime number?',
            difficulty: 'Easy',
            marks: 2,
            options: ['4', '6', '7', '9'],
          },
          {
            id: 'Q2',
            text: 'Evaluate: 12 + 8 \u00f7 2.',
            difficulty: 'Easy',
            marks: 2,
            options: ['10', '14', '16', '20'],
          },
        ],
      },
      {
        title: 'Section B',
        instruction: 'Attempt any two questions. Each question carries 5 marks.',
        questions: [
          {
            id: 'Q3',
            text: 'Solve for x: 3x + 5 = 20.',
            difficulty: 'Moderate',
            marks: 5,
          },
          {
            id: 'Q4',
            text: 'State and prove the Pythagoras theorem with a labelled diagram description.',
            difficulty: 'Challenging',
            marks: 5,
          },
        ],
      },
      {
        title: 'Section C',
        instruction: 'Answer the following in detail. Each question carries 8 marks.',
        questions: [
          {
            id: 'Q5',
            text:
              'A train travels 240 km at a uniform speed. If the speed had been 20 km/h more, ' +
              'it would have taken 2 hours less. Find the original speed of the train.',
            difficulty: 'Challenging',
            marks: 8,
          },
          {
            id: 'Q6',
            text: 'Prove that the sum of angles of a triangle is 180 degrees.',
            difficulty: 'Moderate',
            marks: 8,
          },
        ],
      },
    ],
  });
}
