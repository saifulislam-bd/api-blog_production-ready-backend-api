//custom modules
import { logger } from '@/lib/winston';
import config from '@/config';

//models
import User from '@/models/user';

//types
import type { Request, Response } from 'express';

const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-__v').lean().exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error,
    });
    logger.error(`Error during getting current user`, error);
  }
};

export default getCurrentUser;
