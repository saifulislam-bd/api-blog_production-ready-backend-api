//node modules
import winston from 'winston';

//custom modules
import config from '@/config';

// Define log format
const { combine, timestamp, json, align, errors, printf, colorize } =
  winston.format;

//define the transport for logging
const transports: winston.transport[] = [];

//if the application is in production mode, use console transport
if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
        align(),
        printf(({ level, message, timestamp, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
        }),
      ),
    }),
  );
}

//create a logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL, //set the default log level to 'info'
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports,
  silent: config.NODE_ENV === 'test', //disable logs in test environment
});

export { logger };
