import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const questionTypeSpecSchema = new Schema(
  {
    type: { type: String, enum: ['MCQ', 'Short', 'Long'], required: true },
    count: { type: Number, required: true, min: 1 },
    marksEach: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
    marks: { type: Number, required: true, min: 1 },
    options: { type: [String], default: undefined },
  },
  { _id: false },
);

const sectionSchema = new Schema(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [questionSchema], required: true },
  },
  { _id: false },
);

const headerSchema = new Schema(
  {
    school: { type: String, required: true },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maxMarks: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const generatedPaperSchema = new Schema(
  {
    header: { type: headerSchema, required: true },
    studentInfo: { type: [String], required: true },
    sections: { type: [sectionSchema], required: true },
  },
  { _id: false },
);

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    className: { type: String, trim: true },
    school: { type: String, trim: true },
    timeAllowed: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: {
      type: [questionTypeSpecSchema],
      required: true,
      validate: (v: unknown[]) => Array.isArray(v) && v.length > 0,
    },
    additionalInstructions: { type: String, trim: true },
    sourceFileText: { type: String },
    status: {
      type: String,
      enum: ['queued', 'active', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    jobId: { type: String, index: true },
    generatedPaper: { type: generatedPaperSchema, default: undefined },
    pdfPath: { type: String },
    errorMessage: { type: String },
    rawLlmOutput: { type: String, select: false },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

assignmentSchema.index({ createdAt: -1 });

export type AssignmentDoc = HydratedDocument<InferSchemaType<typeof assignmentSchema>>;

export const Assignment = model('Assignment', assignmentSchema);
