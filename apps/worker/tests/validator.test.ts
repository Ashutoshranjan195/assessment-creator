import { parseLLMResponse } from '../src/validator';

const validPaper = {
  header: {
    school: 'Test School',
    subject: 'Math',
    class: 'Grade 8',
    timeAllowed: '2 hours',
    maxMarks: 10,
  },
  studentInfo: ['Name', 'Roll Number', 'Class', 'Section'],
  sections: [
    {
      title: 'Section A',
      instruction: 'Attempt all',
      questions: [
        {
          id: 'Q1',
          text: '2 + 2 = ?',
          difficulty: 'Easy',
          marks: 5,
          options: ['1', '2', '3', '4'],
        },
        { id: 'Q2', text: 'Solve x: x+1=3', difficulty: 'Moderate', marks: 5 },
      ],
    },
  ],
};

describe('parseLLMResponse', () => {
  it('accepts a valid JSON paper', () => {
    const r = parseLLMResponse(JSON.stringify(validPaper));
    expect(r.ok).toBe(true);
    expect(r.paper?.sections).toHaveLength(1);
  });

  it('strips markdown code fences', () => {
    const r = parseLLMResponse('```json\n' + JSON.stringify(validPaper) + '\n```');
    expect(r.ok).toBe(true);
  });

  it('strips surrounding prose', () => {
    const r = parseLLMResponse('Here is your paper:\n' + JSON.stringify(validPaper) + '\nThanks!');
    expect(r.ok).toBe(true);
  });

  it('rejects when sum of marks mismatches maxMarks', () => {
    const bad = JSON.parse(JSON.stringify(validPaper));
    bad.header.maxMarks = 99;
    const r = parseLLMResponse(JSON.stringify(bad));
    expect(r.ok).toBe(false);
    expect(r.errors?.join(' ')).toMatch(/sum of question marks/);
  });

  it('rejects unknown difficulty', () => {
    const bad = JSON.parse(JSON.stringify(validPaper));
    bad.sections[0].questions[0].difficulty = 'Insane';
    const r = parseLLMResponse(JSON.stringify(bad));
    expect(r.ok).toBe(false);
  });

  it('rejects missing required fields', () => {
    const bad = JSON.parse(JSON.stringify(validPaper));
    delete bad.header.subject;
    const r = parseLLMResponse(JSON.stringify(bad));
    expect(r.ok).toBe(false);
  });

  it('rejects empty / non-JSON input', () => {
    expect(parseLLMResponse('').ok).toBe(false);
    expect(parseLLMResponse('not json at all').ok).toBe(false);
  });
});
