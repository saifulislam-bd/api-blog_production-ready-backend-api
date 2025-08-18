//node modules
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

// custom modules
import config from '@/config';
import limiter from '@/lib/express_rate_limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger } from './lib/winston';

//router
import v1Routes from '@/routes/v1';

//types
import { CorsOptions } from 'cors';

//express app initialization
const app = express();

//configure cors options
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(
          `CORS policy does not allow access from this origin: ${origin}`,
        ),
        false,
      );
      logger.warn(
        `CORS policy does not allow access from this origin: ${origin}`,
      );
    }
  },
};

//enable JSON parsing for incoming requests
app.use(express.json());

//enable URL-encoded data parsing for incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//apply cors middleware
app.use(cors(corsOptions));

//enable response compression to reduce payload size
app.use(
  compression({
    threshold: 1024, // compress responses larger than 1KB
  }),
);

// apply security headers using helmet
app.use(helmet());

//apply rate limiting middleware to reduce the risk of DDoS attacks
app.use(limiter);

/**IIFE to start the server
 -tries to connect to the database before initializing the server
 -defines the api route ('/api/v1') 
*/
(async () => {
  try {
    await connectToDatabase();

    app.use('/api/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start the server: ${error}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
})();

//handle server shutdown
const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Server shut down');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during server shutdown: ${error}`);
  }
};

//listen for termination signals
process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
