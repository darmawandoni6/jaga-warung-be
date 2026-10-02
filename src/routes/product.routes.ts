import { Router } from 'express';
import * as productController from '@/controllers/product.controller';
import { validateRequest } from '@/middlewares/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  getProductByBarcodeSchema,
  queryProductSchema,
} from '@/schemas/product.schema';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest(queryProductSchema), productController.getProductsHandler);
router.get(
  '/barcode/:barcode',
  validateRequest(getProductByBarcodeSchema),
  productController.getProductByBarcodeHandler
);
router.get('/:id', validateRequest(getProductByIdSchema), productController.getProductByIdHandler);
router.post('/', validateRequest(createProductSchema), productController.createProductHandler);
router.put('/:id', validateRequest(updateProductSchema), productController.updateProductHandler);
router.delete(
  '/:id',
  validateRequest(getProductByIdSchema),
  productController.deleteProductHandler
);

export default router;
