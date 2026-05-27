import { buildPrompt, questionPaperSchema } from '@vedaai/shared';

describe('buildPrompt', () => {
  const input = {
    title: 'Algebra Mid-Term',
    subject: 'Mathematics',
    className: 'Grade 10',
    school: 'VedaAI School',
    timeAllowed: '2 hours',
    dueDate: '2099-01-01T00:00:00.000Z',
    questionTypes: [
      { type: 'MCQ' as const, count: 5, marksEach: 2 },
      { type: 'Short' as const, count: 2, marksEach: 5 },
    ],
    additionalInstructions: 'Focus on quadratic equations.',
  };

  it('embeds the JSON schema and assignment specifics', () => {
    const { system, user } = buildPrompt(input, questionPaperSchema);
    expect(system).toMatch(/return ONLY one JSON object|JSON object/i);
    expect(user).toMatch(/Algebra Mid-Term/);
    expect(user).toMatch(/Mathematics/);
    expect(user).toMatch(/5 MCQ question/);
    expect(user).toMatch(/quadratic equations/);
    expect(user).toContain('"GeneratedQuestionPaper"');
  });

  it('adds a stricter suffix on retry', () => {
    const { system } = buildPrompt(input, questionPaperSchema, { stricter: true });
    expect(system).toMatch(/CRITICAL RETRY NOTICE/);
  });

  it('warns about missing reference material', () => {
    const { user } = buildPrompt(input, questionPaperSchema);
    expect(user).toMatch(/No reference material supplied/);
  });

  it('truncates oversized source material', () => {
    const long = 'A'.repeat(10_000);
    const { user } = buildPrompt(
      { ...input, sourceFileText: long },
      questionPaperSchema,
    );
    expect(user.length).toBeLessThan(long.length + 3000);
    expect(user).toMatch(/Reference material/);
  });
});
