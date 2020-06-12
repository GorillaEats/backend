const winston = require('winston');

const { LoggingWinston } = require('@google-cloud/logging-winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  transports: [
    process.env.NODE_ENV === 'production'
      ? new LoggingWinston()
      : new winston.transports.Console(),
  ],
});

module.exports = logger;
