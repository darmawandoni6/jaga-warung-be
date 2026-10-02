import { Request, Response, NextFunction } from 'express';
import * as categoryService from '@/services/category.service';
import { successResponse } from '@/utils/response';
import { Unauthorized } from '@/utils/errors';

export const getCategoriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const categories = await categoryService.getCategories(userId);
    res.status(200).json(successResponse(categories, 'Categories retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const categoryId = req.params.id as string;
    const category = await categoryService.getCategoryById(userId, categoryId);
    res.status(200).json(successResponse(category, 'Category retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const category = await categoryService.createCategory(userId, req.body.name);
    res.status(201).json(successResponse(category, 'Category created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const categoryId = req.params.id as string;
    const category = await categoryService.updateCategory(userId, categoryId, req.body.name);
    res.status(200).json(successResponse(category, 'Category updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const categoryId = req.params.id as string;
    await categoryService.deleteCategory(userId, categoryId);
    res.status(200).json(successResponse(null, 'Category deleted successfully'));
  } catch (error) {
    next(error);
  }
};
