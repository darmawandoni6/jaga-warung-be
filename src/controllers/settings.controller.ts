import { Request, Response, NextFunction } from 'express';
import * as settingsService from '@/services/settings.service';
import { successResponse } from '@/utils/response';
import { Unauthorized } from '@/utils/errors';

export const getStoreProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const profile = await settingsService.getStoreProfile(userId);
    res.status(200).json(successResponse(profile, 'Store profile retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateStoreProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const profile = await settingsService.updateStoreProfile(userId, req.body);
    res.status(200).json(successResponse(profile, 'Store profile updated successfully'));
  } catch (error) {
    next(error);
  }
};
