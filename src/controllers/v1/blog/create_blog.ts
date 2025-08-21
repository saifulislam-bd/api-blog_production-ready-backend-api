//node modules
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

//custom modules
import { logger } from '@/lib/winston';

//models
import Blog from '@/models/blog';

//types
import type { Request, Response } from 'express';
import type { IBlog } from '@/models/blog';

type BlogData = Pick<IBlog, 'title' | 'status' | 'content' | 'banner'>;

//purify the blog content
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, status, content, banner } = req.body as BlogData;
    const userId = req.userId;

    const cleanContent = purify.sanitize(content);
    const newBlog = new Blog({
      title,
      status,
      content: cleanContent,
      banner,
      author: userId,
    });

    logger.info('New blog created', newBlog);
    const blog = await newBlog.save();

    res.status(201).json({ blog });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error,
    });
    logger.error(`Error during blog creation`, error);
  }
};

export default createBlog;
