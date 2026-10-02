import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env';
import { morganMiddleware } from '@/config/logger';
import apiRouter from '@/routes';
import { errorMiddleware } from '@/middlewares/error.middleware';
import { errorResponse } from '@/utils/response';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser(env.COOKIE_SECRET));

// HTTP Request Logging
app.use(morganMiddleware);

// API Routes
app.use('/api-v1', apiRouter);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json(errorResponse(`Endpoint not found: ${req.method} ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorMiddleware);

export default app;
