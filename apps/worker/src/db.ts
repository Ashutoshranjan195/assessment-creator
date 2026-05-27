import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './logger';

// Re-declare the assignment schema in the worker so it remains decoupled from
// the backend service. In practice both services share the same Mongo
// collection. (For a larger project we would extract this into a shared model
// package; kept inline here to keep the scaffold compact.)
const questionTypeSpec = new mongoose.Schema(
  {
    type: { type: String, enum: ['MCQ', 'Short', 'Long'], required: true },
    count: { type: Number, required: true },
    marksEach: { type: Number, required: true },
  },
  { _id: false },
);

const question = new mongoose.Schema(
  {
    id: String,
    text: String,
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'] },
    marks: Number,
    options: { type: [String], default: undefined },
  },
  { _id: false },
);

const section = new mongoose.Schema(
  { title: String, instruction: String, questions: [question] },
  { _id: false },
);

const header = new mongoose.Schema(
  {
    school: String,
    subject: String,
    class: String,
    timeAllowed: String,
    maxMarks: Number,
  },
  { _id: false },
);

const generatedPaper = new mongoose.Schema(
  { header, studentInfo: [String], sections: [section] },
  { _id: false },
);

const assignmentSchema = new mongoose.Schema(
  {
    title: String,
    subject: String,
    className: String,
    school: String,
    timeAllowed: String,
    dueDate: Date,
    questionTypes: [questionTypeSpec],
    additionalInstructions: String,
    sourceFileText: String,
    status: { type: String, enum: ['queued', 'active', 'completed', 'failed'] },
    jobId: String,
    generatedPaper,
    pdfPath: String,
    errorMessage: String,
    rawLlmOutput: String,
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Assignment =
  mongoose.models.Assignment ?? mongoose.model('Assignment', assignmentSchema);

export async function connectMongo(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10_000 });
  logger.info('worker: mongo connected');
}
