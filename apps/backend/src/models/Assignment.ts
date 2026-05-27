import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  name: string;
  dueDate: Date;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId: string;
}

const AssignmentSchema = new Schema<IAssignment>({
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  questionTypes: [{ type: String }],
  numberOfQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  additionalInstructions: String,
  status: { type: String, default: 'pending' },
  jobId: { type: String, required: true }
}, { timestamps: true });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
