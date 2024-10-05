import { Router } from 'express';
import userRouter from '../routes/users';
import productsRouter from '../routes/products';
import sessionRouter from '../routes/session';
import authenticationRouter from '../routes/authentication';
import onboardingRouter from '../routes/onboarding';

const router = Router();

router.use(onboardingRouter);
router.use(sessionRouter);
router.use(authenticationRouter);
router.use(userRouter);
router.use(productsRouter);

export default router;
