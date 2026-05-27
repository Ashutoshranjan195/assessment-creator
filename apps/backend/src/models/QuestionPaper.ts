import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  sections: ISection[];
  generatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  marks: Number
});

const SectionSchema = new Schema<ISection>({
  title: String,
  instruction: String,
  questions: [QuestionSchema]
});

const QuestionPaperSchema = new Schema<IQuestionPaper>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  sections: [SectionSchema],
  generatedAt: { type: Date, default: Date.now }
});

export const QuestionPaper = mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);
