import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { connectMongo } from './db';
import { initSocket } from './ws/socket';
import { logger } from './logger';

async function main(): Promise<void> {
  await connectMongo();
  const app = createApp();
  const httpServer = http.createServer(app);
  initSocket(httpServer);
  httpServer.listen(config.port, () => {
    logger.info({ port: config.port }, 'backend listening');
  });
}

main().catch((err) => {
  logger.error({ err }, 'fatal startup error');
  process.exit(1);
});
