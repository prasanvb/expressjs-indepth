import { Router } from 'express';
import userRouter from '../routes/users';
import productsRouter from '../routes/products';

const router = Router();

router.use(userRouter);
router.use(productsRouter);

export default router;
