//node modules
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

//custom modules
import { logger } from '@/lib/winston';
import { verifyAccessToken } from '@/lib/jwt';

//types
import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied, no token provided',
    });
    return;
  }
  const [_, token] = authHeader?.split(' ');

  try {
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    req.userId = jwtPayload.userId;

    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token expired, request a new one with refresh token',
      });
      return;
    }
    //handle invalid token error
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token invalid',
      });
      return;
    }

    //catch other error
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });
    logger.error('Error during authentication', error);
  }
};

export default authenticate;
