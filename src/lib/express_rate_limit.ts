//node modules
import rateLimit from 'express-rate-limit';

//configure rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60, // limit each IP to 60 requests per windowMs
  standardHeaders: 'draft-8', // use the latest standard headers
  legacyHeaders: false, // disable the deprecated "X-RateLimit-*" headers
  message: {
    error: 'Too many requests, please try again later.',
  },
});

export default limiter;
