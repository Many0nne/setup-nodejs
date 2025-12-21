import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { httpLogger } from './config/logger';
import { errorHandler } from './middleware/error';
import { registerRoutes } from './routes';
import swaggerUi from 'swagger-ui-express';
import { openapi } from './docs/openapi';
import cookieParser from 'cookie-parser';

export function createApp() {
  const app = express();

  app.use(httpLogger);
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(hpp());
  app.use(express.json());
  app.use(cookieParser());

  const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
  app.use('/api/auth', limiter);

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  // Swagger docs
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

  registerRoutes(app);

  app.use(errorHandler);

  return app;
}
