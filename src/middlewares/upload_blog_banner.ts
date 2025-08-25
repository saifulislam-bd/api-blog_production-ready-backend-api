//custom modules
import uploadToCloudinary from '@/lib/cloudinary';
import { logger } from '@/lib/winston';

//models
import Blog from '@/models/blog';

//types
import type { Request, Response, NextFunction } from 'express';
import type { UploadApiErrorResponse } from 'cloudinary';

//constants
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const uploadBanner = (method: 'post' | 'put') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (method === 'put' && !req.file) {
      next();
      return;
    }
    if (!req.file) {
      res
        .status(400)
        .json({ code: 'ValidationError', message: 'Blog banner is required' });
      return;
    }
    if (req.file.size > MAX_FILE_SIZE) {
      res.status(413).json({
        code: 'ValidationError',
        message: 'File size must be less than 2MB',
      });
      return;
    }
    try {
      // const {blogId} = req.params;
      // const blog = await Blog.findById(blogId).select('banner.publicId').exec();

      const data = await uploadToCloudinary(
        req.file.buffer,
        // blog?.banner?.publicId.replace('blog-api/', ''),
      );

      if (!data) {
        res.status(500).json({
          code: 'ServerError',
          message: 'Internal Server Error',
        });
        logger.error('Error during uploading blog banner to cloudinary', {
          // blogId,
          // publicId: blog?.banner?.publicId,
        });
        return;
      }
      const newBanner = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };
      logger.info('Blog banner uploaded successfully', { banner: newBanner });
      req.body.banner = newBanner;
      next();
    } catch (err: UploadApiErrorResponse | any) {
      const statusCode = err.http_code ? err.http_code : 500;
      res.status(statusCode).json({
        code: statusCode < 500 ? 'ValidationError' : err.name,
        message: err.message,
        err,
      });
      logger.error('Error during uploading blog banner to cloudinary', err);
    }
  };
};

export default uploadBanner;
