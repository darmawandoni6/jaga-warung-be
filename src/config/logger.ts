import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import winston from 'winston';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devConsoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileFormat,
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? fileFormat : devConsoleFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

export const morganMiddleware = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: {
    write: (message: string) => {
      logger.http ? logger.http(message.trim()) : logger.info(message.trim());
    },
  },
});

export default logger;
