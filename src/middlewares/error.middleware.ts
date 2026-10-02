import { Request, Response, NextFunction } from 'express';
import createHttpError, { isHttpError, HttpError } from 'http-errors';
import { ZodError } from 'zod';
import { logger } from '@/config/logger';
import { errorResponse } from '@/utils/response';

export { createHttpError, isHttpError, HttpError };

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
    stack: err.stack,
    body: req.body,
  });

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json(errorResponse('Validation error', formattedErrors));
    return;
  }

  if (isHttpError(err)) {
    res.status(err.statusCode || err.status).json(errorResponse(err.message));
    return;
  }

  // Fallback 500 error
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  res.status(500).json(errorResponse(message));
};
