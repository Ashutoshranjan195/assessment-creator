export type Difficulty = 'Easy' | 'Moderate' | 'Challenging';
export type QuestionType = 'MCQ' | 'Short' | 'Long';

export interface QuestionTypeSpec {
  type: QuestionType;
  count: number;
  marksEach: number;
}

export interface AssignmentInput {
  title: string;
  subject?: string;
  className?: string;
  school?: string;
  timeAllowed?: string;
  dueDate: string; // ISO string
  questionTypes: QuestionTypeSpec[];
  additionalInstructions?: string;
  sourceFileText?: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
}

export interface PaperSection {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface PaperHeader {
  school: string;
  subject: string;
  class: string;
  timeAllowed: string;
  maxMarks: number;
}

export interface GeneratedQuestionPaper {
  header: PaperHeader;
  studentInfo: string[];
  sections: PaperSection[];
}

export type JobStatus = 'queued' | 'active' | 'completed' | 'failed';

export interface AssignmentDocument {
  _id: string;
  title: string;
  subject?: string;
  className?: string;
  school?: string;
  timeAllowed?: string;
  dueDate: string;
  questionTypes: QuestionTypeSpec[];
  additionalInstructions?: string;
  sourceFileText?: string;
  status: JobStatus;
  jobId?: string;
  generatedPaper?: GeneratedQuestionPaper;
  pdfPath?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
