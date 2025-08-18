//node modules
import mongoose from 'mongoose';

// custom modules
import config from '@/config';
import { logger } from './winston';

//types
import type { ConnectOptions } from 'mongoose';

//client options
const clientOptions: ConnectOptions = {
  dbName: 'blog-db',
  appName: 'Blog-API',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

//Connect to MongoDB using Mongoose
export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error('MongoDB URI is not defined.');
  }
  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);
    logger.info('Connected to MongoDB successfully.✅', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error connecting to MongoDB: ❌ ${error.message}`);
    }
  }
};

//Disconnect from MongoDB
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB. ✅', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    logger.error(`Error disconnecting from MongoDB ❌ : ${error}`);
  }
};
