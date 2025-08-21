//node modules
import { Router } from 'express';
import multer from 'multer';
import { body } from 'express-validator';

//middlewares
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';
import uploadBlogBanner from '@/middlewares/upload_blog_banner';

//controllers
import createBlog from '@/controllers/v1/blog/create_blog';

const upload = multer();

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  upload.single('banner_image'),
  uploadBlogBanner('post'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 180 })
    .withMessage('Title cannot exceed 180 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status')
    .trim()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  validationError,
  createBlog,
);

export default router;
