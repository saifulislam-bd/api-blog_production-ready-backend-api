//custom modules
import { logger } from '@/lib/winston';

//models
import User from '@/models/user';

//types
import type { Request, Response, NextFunction } from 'express';

export type AuthRole = 'user' | 'admin';

const authorize = (roles: AuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    try {
      const user = await User.findById(userId).select('role').exec();

      if (!user) {
        res.status(404).json({
          code: 'NotFound',
          message: 'User not found',
        });
        return;
      }
      if (!roles.includes(user.role)) {
        res.status(403).json({
          error: 'AuthorizationError',
          message: 'You are not authorized to access this resource.',
        });
        return;
      }
      return next();
    } catch (error) {
      res.status(500).json({
        code: 'ServerError',
        message: 'Internal Server Error',
        error,
      });
      logger.error(`Error during authorization`, error);
    }
  };
};

export default authorize;
