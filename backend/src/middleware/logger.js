const winston = require('winston');
const morgan = require('morgan');

// Configure winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Custom morgan token for request body
morgan.token('body', (req) => JSON.stringify(req.body));

// Custom morgan format
const morganFormat = ':method :url :status :response-time ms - :body';

// Morgan middleware with winston
const httpLogger = morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user ? req.user.id : null,
  });
  next(err);
};

module.exports = {
  logger,
  httpLogger,
  errorLogger,
}; 