import pino from 'pino';
import pinoHttp from 'pino-http';

const isProd = process.env.NODE_ENV === 'production';
const level = process.env.LOG_LEVEL ?? (isProd ? 'warn' : 'info');

export const logger = pino({
  level,
  transport: !isProd
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});

export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req(req) {
      return { id: (req as any).id, method: req.method, url: req.url };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
    err(err) {
      return { type: (err as any).type, message: err.message };
    },
  },
  autoLogging: {
    ignore: (req) => {
      const url = req.url || '';
      return (
        url === '/health' ||
        url.startsWith('/docs') ||
        url.startsWith('/favicon') ||
        url.startsWith('/_next') ||
        url.startsWith('/static') ||
        url.startsWith('/assets')
      );
    },
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
