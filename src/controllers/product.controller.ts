import { Request, Response, NextFunction } from 'express';
import * as productService from '@/services/product.service';
import { successResponse } from '@/utils/response';
import { Unauthorized } from '@/utils/errors';

export const getProductsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const products = await productService.getProducts(userId, req.query as any);
    res.status(200).json(successResponse(products, 'Products retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProductByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const id = req.params.id as string;
    const product = await productService.getProductById(userId, id);
    res.status(200).json(successResponse(product, 'Product retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProductByBarcodeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const barcode = req.params.barcode as string;
    const product = await productService.getProductByBarcode(userId, barcode);
    res.status(200).json(successResponse(product, 'Product retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const product = await productService.createProduct(userId, req.body);
    res.status(201).json(successResponse(product, 'Product created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const id = req.params.id as string;
    const product = await productService.updateProduct(userId, id, req.body);
    res.status(200).json(successResponse(product, 'Product updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const id = req.params.id as string;
    await productService.deleteProduct(userId, id);
    res.status(200).json(successResponse(null, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
};
