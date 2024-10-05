import { Router } from 'express';
import userRouter from '../routes/users';
import productsRouter from '../routes/products';
import sessionRouter from '../routes/session';

const router = Router();

router.use(sessionRouter);
router.use(userRouter);
router.use(productsRouter);

export default router;
