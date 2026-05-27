import 'dotenv/config';
import { Worker } from 'bullmq';
import { generateQuestionPaper } from '../services/openai';
import { QuestionPaper } from '../models/QuestionPaper';
import { Assignment } from '../models/Assignment';
import { redisConnection } from '../config/redis';

const worker = new Worker('question-generation', async (job) => {
  const { assignmentId } = job.data;
  await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
  await job.updateProgress({ progress: 10, assignmentId, message: 'Starting AI generation' });
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    await job.updateProgress({ progress: 30, assignmentId, message: 'Generating questions' });
    const paperData = await generateQuestionPaper(assignment.toObject());
    await job.updateProgress({ progress: 70, assignmentId, message: 'Saving paper' });
    const paper = await QuestionPaper.create({
      assignmentId: assignment._id,
      sections: paperData.sections,
    });
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
    return { assignmentId: assignmentId.toString(), resultUrl: '/api/assignments/' + assignmentId + '/result', paper };
  } catch (err) {
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
    throw err;
  }
}, { connection: redisConnection });

console.log('Worker started');
