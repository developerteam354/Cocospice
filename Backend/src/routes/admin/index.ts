import { Router } from 'express';
import authRoutes     from './auth.routes.js';
import productRoutes  from './product.routes.js';
import uploadRoutes   from './upload.routes.js';
import categoryRoutes from './category.routes.js';

const adminRouter = Router();

adminRouter.use('/auth',       authRoutes);
adminRouter.use('/products',   productRoutes);
adminRouter.use('/upload',     uploadRoutes);
adminRouter.use('/categories', categoryRoutes);

export default adminRouter;
