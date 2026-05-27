import { createAssignmentSchema } from '../src/validators/assignment';

const futureISO = (days = 7): string => new Date(Date.now() + days * 86_400_000).toISOString();

describe('createAssignmentSchema', () => {
  const base = {
    title: 'Algebra mid-term',
    dueDate: futureISO(),
    questionTypes: [{ type: 'MCQ', count: 5, marksEach: 2 }],
  };

  it('accepts a valid payload', () => {
    expect(() => createAssignmentSchema.parse(base)).not.toThrow();
  });

  it('rejects empty title', () => {
    expect(() => createAssignmentSchema.parse({ ...base, title: '' })).toThrow();
  });

  it('rejects negative counts', () => {
    expect(() =>
      createAssignmentSchema.parse({
        ...base,
        questionTypes: [{ type: 'MCQ', count: -1, marksEach: 2 }],
      }),
    ).toThrow();
  });

  it('rejects past dueDate', () => {
    expect(() =>
      createAssignmentSchema.parse({ ...base, dueDate: '2000-01-01T00:00:00.000Z' }),
    ).toThrow();
  });

  it('rejects when no question types supplied', () => {
    expect(() => createAssignmentSchema.parse({ ...base, questionTypes: [] })).toThrow();
  });

  it('rejects unknown question type', () => {
    expect(() =>
      createAssignmentSchema.parse({
        ...base,
        questionTypes: [{ type: 'Essay' as 'MCQ', count: 1, marksEach: 1 }],
      }),
    ).toThrow();
  });
});
