//node modules
import { Router } from 'express';
const router = Router();

//routes
import authRoutes from '@/routes/v1/auth';
import userRoutes from '@/routes/v1/user';

//root route
router.get('/', (_req, res) => {
  res.status(200).json({
    message: 'API is live',
    status: 'ok',
    version: '1.0.0',
    timeStamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
