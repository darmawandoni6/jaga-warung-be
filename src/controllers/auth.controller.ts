import { Request, Response, NextFunction, CookieOptions } from 'express';
import createHttpError from 'http-errors';
import { env } from '@/config/env';
import * as authService from '@/services/auth.service';
import { successResponse } from '@/utils/response';

const REFRESH_COOKIE_NAME = 'refreshToken';

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/',
});

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, tokens } = await authService.register(req.body);

    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, getCookieOptions());

    res.status(201).json(
      successResponse(
        {
          user,
          accessToken: tokens.accessToken,
        },
        'User registered successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, tokens } = await authService.login(req.body);

    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, getCookieOptions());

    res.status(200).json(
      successResponse(
        {
          user,
          accessToken: tokens.accessToken,
        },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const refreshHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken =
      req.cookies?.[REFRESH_COOKIE_NAME] || req.signedCookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      throw createHttpError.Unauthorized('Refresh token not found in cookies');
    }

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    res.status(200).json(
      successResponse(
        {
          accessToken,
        },
        'Access token refreshed successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      ...getCookieOptions(),
      maxAge: 0,
    });

    res.status(200).json(successResponse(null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

export const meHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw createHttpError.Unauthorized('Unauthorized');
    }

    const user = await authService.getProfile(req.user.id);

    res.status(200).json(successResponse(user, 'Profile fetched successfully'));
  } catch (error) {
    next(error);
  }
};
