import { createApp } from './app';
import { Env } from './config/env';
import { logger } from './config/logger';
import { disconnectPrisma } from './db/client';

const app = createApp();

const server = app.listen(Env.PORT, () => {
  logger.info({ port: Env.PORT }, 'Server listening');
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutdown initiated');
  server.close(async () => {
    try {
      await disconnectPrisma();
    } catch {}
    logger.info('Shutdown complete');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
