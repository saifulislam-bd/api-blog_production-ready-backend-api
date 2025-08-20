//custom modules
import { logger } from '@/lib/winston';

//models
import User from '@/models/user';

//types
import type { Request, Response } from 'express';

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    await User.deleteOne({ _id: userId });

    res.sendStatus(204);
    logger.info('A user account has been deleted', { userId });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error,
    });
    logger.error(`Error during deleting a user account`, error);
  }
};

export default deleteUser;
