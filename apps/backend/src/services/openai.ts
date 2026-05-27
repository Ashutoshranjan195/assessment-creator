import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuestionPaper(assignmentData: any): Promise<any> {
  const prompt = 'You are an exam paper generator. Create a question paper based on the following requirements:' +
    ' Name: ' + assignmentData.name +
    ' Question types: ' + assignmentData.questionTypes.join(', ') +
    ' Number of questions: ' + assignmentData.numberOfQuestions +
    ' Total marks: ' + assignmentData.totalMarks +
    ' Additional instructions: ' + (assignmentData.additionalInstructions || 'None') +
    ' Distribute marks and difficulty (easy, medium, hard) proportionally across sections.' +
    ' Respond ONLY with a valid JSON object of this exact structure:' +
    ' { "sections": [ { "title": "Section A", "instruction": "Attempt all questions", "questions": [ { "text": "What is 2+2?", "difficulty": "easy", "marks": 2 } ] } ] }';

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No content from AI');
  return JSON.parse(content);
}
