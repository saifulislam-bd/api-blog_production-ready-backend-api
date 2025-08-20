//node modules
import { Router } from 'express';
import { body, query, param } from 'express-validator';

//middlewares
import validationError from '@/middlewares/validationError';
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';

//controllers
import getCurrentUser from '@/controllers/v1/user/get_current_user';
import updateCurrentUser from '@/controllers/v1/user/update_current_user';
import deleteCurrentUser from '@/controllers/v1/user/delete_current_user';

import getAllUser from '@/controllers/v1/user/get_all_user';
import getUser from '@/controllers/v1/user/get_user';
import deleteUser from '@/controllers/v1/user/delete_user';

//models
import User from '@/models/user';

const router = Router();

router.get(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  getCurrentUser,
);

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  body('username')
    .trim()
    .optional()
    .isLength({ min: 3, max: 15 })
    .withMessage('Username must be between 3 and 15 characters')
    .custom(async (value) => {
      const usernameExists = await User.exists({ username: value });
      if (usernameExists) {
        throw new Error('Username already exists');
      }
    }),
  body('email')
    .trim()
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters')
    .custom(async (value) => {
      const emailExists = await User.exists({ email: value });
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }),
  body('password')
    .trim()
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .trim()
    .optional()
    .isLength({ max: 20 })
    .withMessage('First name must be less than 20 characters'),
  body('lastName')
    .trim()
    .optional()
    .isLength({ max: 20 })
    .withMessage('Last name must be less than 20 characters'),
  body([
    'website',
    'facebook',
    'instagram',
    'linkedin',
    'github',
    'x',
    'youtube',
  ])
    .optional()
    .isURL()
    .withMessage('Invalid URL format')
    .isLength({ max: 100 })
    .withMessage('Url must be less than 100 characters'),
  validationError,
  updateCurrentUser,
);

router.delete(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  deleteCurrentUser,
);

router.get(
  '/',
  authenticate,
  authorize(['admin']),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  validationError,
  getAllUser,
);

router.get(
  '/:userId',
  authenticate,
  authorize(['admin']),
  param('userId').notEmpty().isMongoId().withMessage('Invalid user ID format'),
  validationError,
  getUser,
);

router.delete(
  '/:userId',
  authenticate,
  authorize(['admin']),
  param('userId').notEmpty().isMongoId().withMessage('Invalid user ID format'),
  validationError,
  deleteUser,
);

export default router;
