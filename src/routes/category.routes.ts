import { Router } from 'express';
import * as categoryController from '@/controllers/category.controller';
import { validateRequest } from '@/middlewares/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
} from '@/schemas/category.schema';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.getCategoriesHandler);
router.get(
  '/:id',
  validateRequest(getCategoryByIdSchema),
  categoryController.getCategoryByIdHandler
);
router.post('/', validateRequest(createCategorySchema), categoryController.createCategoryHandler);
router.put('/:id', validateRequest(updateCategorySchema), categoryController.updateCategoryHandler);
router.delete(
  '/:id',
  validateRequest(getCategoryByIdSchema),
  categoryController.deleteCategoryHandler
);

export default router;
