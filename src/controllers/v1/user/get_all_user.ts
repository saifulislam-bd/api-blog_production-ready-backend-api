//custom modules
import { logger } from '@/lib/winston';
import config from '@/config';

//models
import User from '@/models/user';

//types
import type { Request, Response } from 'express';

const getAllUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit =
      parseInt(req.query.limit as string) || config.DEFAULT_RESULT_LIMIT;
    const offset =
      parseInt(req.query.offset as string) || config.DEFAULT_RESULT_OFFSET;
    const total = await User.countDocuments();

    const users = await User.find()
      .select('-__v')
      .limit(limit)
      .skip(offset)
      .lean()
      .exec();

    res.status(200).json({ limit, offset, total, users });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error,
    });
    logger.error(`Error during getting all the user`, error);
  }
};

export default getAllUser;
