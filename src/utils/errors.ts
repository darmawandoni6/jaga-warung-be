import createHttpError, { isHttpError, HttpError } from 'http-errors';

export { createHttpError, isHttpError, HttpError };

/**
 * Standardized HTTP error helpers
 */
export const BadRequest = (msg = 'Bad Request') => createHttpError.BadRequest(msg);

export const Unauthorized = (msg = 'Unauthorized') => createHttpError.Unauthorized(msg);

export const Forbidden = (msg = 'Forbidden') => createHttpError.Forbidden(msg);

export const NotFound = (msg = 'Resource not found') => createHttpError.NotFound(msg);

export const Conflict = (msg = 'Resource already exists') => createHttpError.Conflict(msg);

export const UnprocessableEntity = (msg = 'Unprocessable Entity') =>
  createHttpError.UnprocessableEntity(msg);

export const InternalServerError = (msg = 'Internal Server Error') =>
  createHttpError.InternalServerError(msg);

export default createHttpError;
