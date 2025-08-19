//custom modules
import { logger } from '@/lib/winston';
import config from '@/config';

//models
import Token from '@/models/token';

//types
import type { Request, Response } from 'express';

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken as string;

    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });

      logger.info('User refresh token deleted successfully', {
        userId: req.userId,
        token: refreshToken,
      });
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.sendStatus(204);
    logger.info('User logged out successfully', {
      userId: req.userId,
    });
  } catch (error) {
    logger.error(`Error logout user: ${error}`);
    res
      .status(500)
      .json({ code: 'Server Error', message: 'Internal Server Error', error });
    logger.error(`Error during user logout`, error);
  }
};

export default logout;
