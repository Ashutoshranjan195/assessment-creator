import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  name: string;
  dueDate: Date;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'queued';
  jobId: string;
  errorMessage?: string;
  generatedPaper?: string;
  pdfPath?: string;
  attempts?: number;
  title?: string;
}

const AssignmentSchema = new Schema<IAssignment>({
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  questionTypes: [{ type: String }],
  numberOfQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  additionalInstructions: String,
  status: { type: String, default: 'pending' },
  jobId: { type: String },
  errorMessage: String,
  generatedPaper: String,
  pdfPath: String,
  attempts: { type: Number, default: 0 },
  title: String
}, { timestamps: true });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
