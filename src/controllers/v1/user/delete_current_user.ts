//custom modules
import { logger } from '@/lib/winston';

//models
import User from '@/models/user';

//types
import type { Request, Response } from 'express';

const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    await User.deleteOne({ _id: req.userId });

    res.sendStatus(204);
    logger.info('A user account has been deleted', { userId });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error,
    });
    logger.error(`Error during deleting current user account`, error);
  }
};

export default deleteCurrentUser;
