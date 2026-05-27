import { Router, type Router as ExpressRouter } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { Assignment } from '../models/Assignment';
import { createAssignmentSchema, listQuerySchema } from '../validators/assignment';
import { HttpError } from '../middleware/error';
import { getQueue, type GenerationJobData } from '../queue/generationQueue';
import { emitJobQueued } from '../ws/socket';
import { config } from '../config';

export const assignmentsRouter: ExpressRouter = Router();

// POST /api/assignments — create + enqueue
assignmentsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = createAssignmentSchema.parse(req.body);
    const doc = await Assignment.create({
      ...parsed,
      dueDate: new Date(parsed.dueDate),
      status: 'queued',
    });
    const job = await getQueue().add(
      'generate',
      { assignmentId: doc.id, attempt: 0 } satisfies GenerationJobData,
      { jobId: `assignment-${doc.id}` },
    );
    doc.jobId = job.id;
    await doc.save();
    emitJobQueued({ jobId: job.id!, assignmentId: doc.id });
    res.status(201).json({ assignmentId: doc.id, jobId: job.id });
  } catch (err) {
    next(err);
  }
});

// GET /api/assignments — paginated list
assignmentsRouter.get('/', async (req, res, next) => {
  try {
    const { page, pageSize } = listQuerySchema.parse(req.query);
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      Assignment.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .select('-rawLlmOutput')
        .lean(),
      Assignment.countDocuments({}),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (err) {
    next(err);
  }
});

// GET /api/assignments/:id — single
assignmentsRouter.get('/:id', async (req, res, next) => {
  try {
    const doc = await Assignment.findById(req.params.id).select('-rawLlmOutput').lean();
    if (!doc) throw new HttpError(404, 'Assignment not found');
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// POST /api/assignments/:id/regenerate — re-enqueue
assignmentsRouter.post('/:id/regenerate', async (req, res, next) => {
  try {
    const doc = await Assignment.findById(req.params.id);
    if (!doc) throw new HttpError(404, 'Assignment not found');
    doc.status = 'queued';
    doc.errorMessage = undefined;
    doc.generatedPaper = undefined;
    doc.pdfPath = undefined;
    doc.attempts = 0;
    await doc.save();
    const job = await getQueue().add(
      'generate',
      { assignmentId: doc.id, attempt: 0 } satisfies GenerationJobData,
      // Unique jobId per regeneration to avoid duplicate-job rejection.
      { jobId: `assignment-${doc.id}-${Date.now()}` },
    );
    doc.jobId = job.id;
    await doc.save();
    emitJobQueued({ jobId: job.id!, assignmentId: doc.id });
    res.status(202).json({ assignmentId: doc.id, jobId: job.id });
  } catch (err) {
    next(err);
  }
});

// GET /api/assignments/:id/pdf — download generated PDF
assignmentsRouter.get('/:id/pdf', async (req, res, next) => {
  try {
    const doc = await Assignment.findById(req.params.id).select('pdfPath title').lean();
    if (!doc) throw new HttpError(404, 'Assignment not found');
    if (!doc.pdfPath) throw new HttpError(404, 'PDF not generated yet');
    const absPath = path.isAbsolute(doc.pdfPath)
      ? doc.pdfPath
      : path.resolve(config.pdfStorageDir, path.basename(doc.pdfPath));
    try {
      await fs.access(absPath);
    } catch {
      throw new HttpError(404, 'PDF file missing from storage');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${sanitizeFilename(doc.title)}.pdf"`,
    );
    res.sendFile(absPath);
  } catch (err) {
    next(err);
  }
});

function sanitizeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 80) || 'paper';
}
