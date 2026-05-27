import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { assignmentsRouter } from './routes/assignments';
import { errorHandler, notFoundHandler } from './middleware/error';

export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/assignments', assignmentsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
