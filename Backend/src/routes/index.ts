import { Router } from 'express';
import adminRouter from './admin/index.js';

const router = Router();

router.use('/admin', adminRouter);

export default router;
