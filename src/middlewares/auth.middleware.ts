import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { errorResponse } from '@/utils/response';

export interface JwtUserPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(401)
      .json(errorResponse('Unauthorized: Authorization header with Bearer token is required'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUserPayload;
    req.user = payload;
    next();
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json(errorResponse('Unauthorized: Access token has expired'));
      return;
    }
    res.status(401).json(errorResponse('Unauthorized: Invalid access token'));
  }
};
