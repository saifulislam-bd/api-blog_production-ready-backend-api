//node modules
import * as express from 'express';

//types
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
    }
  }
}
