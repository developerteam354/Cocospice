import { Router } from 'express';
import { categoryController } from '../../controllers/admin/category.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/',              categoryController.getAll);
router.post('/',             categoryController.create);
router.put('/:id',           categoryController.update);
router.patch('/:id/toggle',  categoryController.toggle);
router.delete('/:id',        categoryController.delete);

export default router;
